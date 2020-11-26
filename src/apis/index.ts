import { get } from "@/utils/request";
import { WxShare, Info } from "@/types";
import { API } from "@/consts/index";

const getWxShare = (): Promise<WxShare> => get(API.wxShare);

const getInfo = (): Promise<Info> => get(API.info);

export { getWxShare, getInfo };
