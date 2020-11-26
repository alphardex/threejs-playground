// @ts-ignore
import wx from "weixin-js-sdk";
import { Info } from "@/types";
import { getWxShare } from "@/apis";

export default () => {
  const wxShare = async (info: Info) => {
    document.title = info.title || "";
    document.querySelector("meta[name=description]")!.setAttribute("content", info.description || "");
    document.querySelector("meta[name=keywords]")!.setAttribute("content", info.keywords || "");
    const shareInfo = info.share_info;
    if (shareInfo) {
      shareInfo.callback = () => {
        location.reload();
      };
      shareInfo.apilist = ["hideMenuItems", "onMenuShareTimeline", "onMenuShareAppMessage"];
      const wxConfig = await getWxShare();
      wx.config({
        debug: false,
        appId: wxConfig.appid,
        timestamp: wxConfig.timestamp,
        nonceStr: wxConfig.noncestr,
        signature: wxConfig.signature,
        jsApiList: shareInfo.apilist,
      });
      wx.ready(() => {
        wx.onMenuShareTimeline({
          title: shareInfo.title,
          link: shareInfo.url,
          imgUrl: shareInfo.img,
          success() {
            shareInfo.callback && shareInfo.callback();
          },
          cancel() {
            shareInfo.callback && shareInfo.callback();
          },
        });
        wx.onMenuShareAppMessage({
          title: shareInfo.title,
          desc: shareInfo.desc,
          link: shareInfo.url,
          imgUrl: shareInfo.img,
          type: "",
          dataUrl: "",
          success() {
            shareInfo.callback && shareInfo.callback();
          },
          cancel() {
            shareInfo.callback && shareInfo.callback();
          },
        });
      });
    }
  };
  return {
    wxShare,
  };
};
