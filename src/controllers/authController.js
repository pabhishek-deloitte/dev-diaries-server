require("dotenv").config({ path: `${process.cwd()}/.env` });
const qs = require("querystring");
const requestWrapper = require("../common/requestWrapper");
const errorResponses = require("../common/errorResponses");

// config to define app settings
const config = process.env;

const authHandler = async (req, res) => {
  try {
    const { code } = req ? req.query : null;
    const { client_id, client_secret, redirect_uri, token_url } = config;
    // configure request params
    const options = {
      method: "POST",
      url: `${token_url}?${qs.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri,
        state: req && req.session ? req.session.csrf_string : null
      })}`,
      headers: {
        accept: "application/json"
      }
    };
    console.log("request", options);

    const { data } = await requestWrapper(options);
    console.log("authresponse", data);
    if (data) {
      const options_user = {
        method: "GET",
        url: `${config.user_url}?access_token=${data.access_token}`,
        headers: {
          accept: "application/json",
          "User-Agent": "custom"
        }
      };
      const userResponse = await requestWrapper(options_user);
      console.log(userResponse.data);
      res.json(userResponse.data);
      //   checkUserEntry(userResponse.data);
    }
    // make a request for auth_token using above options
  } catch (error) {
    // console.log('Internal Error', error);
    res.status(403).json(errorResponses.Unauthenticated);
  }
};

module.exports = authHandler;