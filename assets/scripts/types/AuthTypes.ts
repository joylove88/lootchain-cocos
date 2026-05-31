/** 后端登录成功返回的 token 名和值，HttpClient 会按 tokenName 动态设置请求头。 */
export interface PlayerTokenVO {
  tokenName: string;
  tokenValue: string;
}
