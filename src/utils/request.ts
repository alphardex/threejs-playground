import axios from "axios";
import Alert from "@/utils/alert";
import { activityID, publicKey, useEncrypt } from "@/consts/index";
import qs from "qs";
import md5 from "blueimp-md5";
// @ts-ignore
import JSEncrypt from "jsencrypt";

const service = axios.create();

const rsaEncrypt = (rawData: any) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const rsaData = encryptor.encrypt(JSON.stringify(rawData));
  return rsaData;
};

const md5Encrypt = (rawData: any) => {
  const query = qs.stringify(rawData, { encode: false });
  const md5Data = md5(query);
  return md5Data;
};

service.interceptors.request.use((config) => {
  if (config.method === "post") {
    const data = config.data;
    if (useEncrypt) {
      const entries = Object.entries(data);
      entries.sort();
      const rsaRawData = Object.fromEntries(entries);
      const md5RawData = { ...rsaRawData, key: activityID };
      const md5Data = md5Encrypt(md5RawData);
      const rsaData = rsaEncrypt(rsaRawData);
      config.headers.Authorization = md5Data;
      const fd = new FormData();
      fd.append("data", rsaData);
      config.data = fd;
    } else {
      const fd = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        fd.append(key, value as string | Blob);
      });
      config.data = fd;
    }
  }
  return config;
});

service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

const get = (url: string, params = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    service
      .get(url, { params })
      .then((res) => {
        const data = res.data;
        if (parseInt(data.code) === 200) {
          resolve(data.data);
        } else {
          Alert.fire(data.msg);
          resolve(data);
        }
      })
      .catch((res) => {
        reject(res.data);
      });
  });
};

const post = (url: string, data = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    service
      .post(url, data)
      .then((res) => {
        const data = res.data;
        if (data.code === 200) {
          resolve(data);
        } else {
          Alert.fire(data.msg);
          resolve(data);
        }
      })
      .catch((res) => {
        reject(res.data);
      });
  });
};

export { get, post, service };
