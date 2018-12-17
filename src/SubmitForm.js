import React, { Component } from 'react';
import './App.css';
import { Upload, Button, Form, Input, Icon, message } from 'antd';
import { post } from './common/server/helper/serverAPIClient';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const Dragger = Upload.Dragger;

class SubmitForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      uploading: false,
    };
  }

  postFormData = async (req) => {
    const { email, fileList, firstName, lastName, message, subject} = req;
    const requestUrl = 'http://168.63.148.93/triadaUpload.php';
    try {
      message.loading('Action in progress..', 0);
      const response = await post({
        requestUrl,
        email,
        fileList,
        firstName,
        lastName,
        message, 
        subject,
      });
      message.destroy();
      console.log(response);
      if(response.status === 'ok') {
        message.success('Upload successful');
        this.setState({fileList: [], uploading: false}, this.props.form.resetFields());
      } else {
        message.error('Upload failed');
      }
    } catch (e) {
      message.destroy();
      message.error('Upload failed');
    }
  };

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.postFormData(values);
      }
    });
  };

  renderFormInputItem = (label, varName, msg) => {
    const { getFieldDecorator } = this.props.form;
    let rules = [{required: true, message: msg,}];
    if (label === 'Email') {
      rules.push({type: 'email', message: 'The input is not valid Email!'});
    }
    return (
      <FormItem
        {...formItemLayout}
        label={label}
      >
        {getFieldDecorator(varName, {rules})(
          <Input />
        )}
      </FormItem>
    );
  };

  renderFormButton = (label, type = 'primary', htmlType = 'submit') => {
    const { uploading, fileList } = this.state;
    return (
      <FormItem
        wrapperCol={{ span: 12, offset: 5 }}
      >
        <Button type={type} htmlType={htmlType} loading={uploading} disabled={fileList.length === 0} >
          {uploading ? 'Uplading' : label}
        </Button>
      </FormItem>
    );
  }

  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }

  renderUploadFiles = (msg) => {
    const { getFieldDecorator } = this.props.form;
    const { fileList } = this.state;
    const props = {
      name: 'file',
      multiple: true,
      action: 'localhost/triadaUpload.php',
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        const sizeLimit = file.size / 1024 / 1024 < 2;
        if(file.type !== 'application/pdf') {
          message.error('Only PDF is allowed');
        } else if(!sizeLimit) {
          message.error('PDF is too large!');
        } else {
          this.setState(state => ({
            fileList: [...state.fileList, file],
          }));
        }
        return false;
      },
      fileList
    };
    return (
      <FormItem
        {...formItemLayout}
        label="Files"
      >
        {getFieldDecorator('fileList', {
          getValueFromEvent: this.normFile,
          rules:[{required: true, message: msg}]
        })(<Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
        </Dragger>)}
      </FormItem>
    );
  };

  render() {
    return (
      <Form className="SubmitForm" onSubmit={this.handleSubmit}>
        {this.renderFormInputItem("First Name", "firstName", 'Please input your first name!')}
        {this.renderFormInputItem("Last Name", "lastName", 'Please input your last name!')}
        {this.renderFormInputItem("Email", "email", 'Please input your email!')}
        {this.renderFormInputItem("Subject", "subject", 'Please input your subject!')}
        {this.renderFormInputItem("Message", "message", 'Please input your message!')}
        {this.renderUploadFiles('Please select your file(s)!')}
        {this.renderFormButton('Submit file(s)', 'primary', 'submit')}
      </Form>
    );
  }
}

export default Form.create()(SubmitForm);
