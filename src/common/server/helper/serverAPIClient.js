import request from 'superagent';
import _ from 'lodash';

const generateEmptyResponse = (emptyResponse, errorMessage) => ({
  ...emptyResponse,
  errorMessage,
});

const handleResponse = (method, url, emptyResponse, resolve, reject) => {
  return (err, resReq) => {
    if (err) {
      console.error(`${method} call ${url} error:`, JSON.stringify(err));
      return reject(err);
    }

    try {
      const response = JSON.parse(resReq.text);
      if (_.isArray(response)) {
        return resolve({ ...emptyResponse, items: response });
      } else {
        return resolve({ ...emptyResponse, ...response });
      }
    } catch (e) {
      console.error(`${method} call ${url} error:`, JSON.stringify(e));
      return reject(generateEmptyResponse(emptyResponse, 'SERVER_ERROR'));
    }
  };
};

export const post = (
  {
    requestUrl,
    email,
    fileList,
    firstName,
    lastName,
    message, 
    subject,
  },
  emptyResponse = {}
) => {
  return new Promise((resolve, reject) => {
    const req = request
      .post(requestUrl)
      .field({email, firstName, lastName, message, subject})
      .timeout({ response: 30000 });
    fileList.forEach((file) => req.attach('files[]', file.originFileObj));
    req
      .end(handleResponse('post', requestUrl, emptyResponse, resolve, reject));
  });
};

export const get = (
  {
    requestUrl,
    apiKey = '',
    locale = 'en-GB',
    query = {},
    authorization = '',
    extraHeaders = {},
  },
  emptyResponse = {}
) => {
  return new Promise((resolve, reject) => {
    request
      .get(requestUrl)
      .set('x-api-key', apiKey)
      .set('Accept-Language', locale)
      .set('Authorization', authorization)
      .set('Content-Type', 'application/json;charset=UTF-8')
      .set(extraHeaders)
      .query(query)
      .timeout({ response: 30000 })
      .end(handleResponse('get', requestUrl, emptyResponse, resolve, reject));
  });
};

export const put = (
  {
    requestUrl,
    body,
    apiKey,
    locale = 'en-GB',
    authorization = '',
    extraHeaders = {},
  },
  emptyResponse = {}
) => {
  return new Promise((resolve, reject) => {
    request
      .put(requestUrl)
      .send(body)
      .set('x-api-key', apiKey)
      .set('Accept-Language', locale)
      .set('Authorization', authorization)
      .set('Content-Type', 'application/json;charset=UTF-8')
      .set(extraHeaders)
      .timeout({ response: 30000 })
      .end(handleResponse('put', requestUrl, emptyResponse, resolve, reject));
  });
};

export const del = (
  {
    requestUrl,
    body,
    apiKey,
    locale = 'en-GB',
    authorization = '',
    extraHeaders = {},
  },
  emptyResponse = {}
) => {
  return new Promise((resolve, reject) => {
    request
      .delete(requestUrl)
      .send(body)
      .set('x-api-key', apiKey)
      .set('Accept-Language', locale)
      .set('Authorization', authorization)
      .set('Content-Type', 'application/json;charset=UTF-8')
      .set(extraHeaders)
      .timeout({ response: 30000 })
      .end(
        handleResponse('delete', requestUrl, emptyResponse, resolve, reject)
      );
  });
};

export const getHtml = ({ requestUrl, query = {} }) => {
  return request.get(requestUrl).query(query).then(res => res.text);
};
