import React, { useState } from "react";
import { getRecomdoConfig, updateConfigValue } from "../api/prisma.server";
import { apiVersion, authenticate } from "../shopify.server";
import shopify from "../shopify.server";

const TOKEN_ENDPOINT = "search/recomdoai_api/get_token";

export const loader = async ({ request }) => {
  var data = await getRecomdoConfig({
    path: "gen_base_url",
  });
  return data;
};

export const getAuthToken = async () => {
  const authData = await getAuthDetails();
  var gen_base_url = authData.gen_base_url;
  var gen_access_key = authData.gen_access_key;
  var gen_access_secret = authData.gen_access_secret;
  var gen_client_key = authData.gen_client_key;
  const URL = gen_base_url + TOKEN_ENDPOINT;
  const myHeaders = new Headers();
  myHeaders.append("Access-Key", gen_access_key);
  myHeaders.append("Access-Secret", gen_access_secret);
  myHeaders.append("Client-Key", gen_client_key);
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const res = await fetch(URL, requestOptions)
    .then(handleErrors)
    .then((res) => res.json());

  if (typeof res[0].data != "undefined") {
    await updateConfigValue({
      path: "gen_access_token",
      value: res[0].data["Authorization Key"],
    });
    console.log("AUTH KEY SAVED SUCCESSFULLY");
  }
  return res;
};

export const getAPIRequest = async (endpoint) => {
  var authData = await getAuthDetails();
  console.log("authData", authData);
  var token = authData.gen_access_token;
  if (!authData.gen_access_token) {
    var token = await getAuthToken();
    token = token[0].data["Authorization Key"];
  }
  const headers = new Headers();
  var URL = authData.gen_base_url + endpoint;
  headers.append("Client-Key", authData.gen_client_key);
  headers.append("Authorization", "Bearer " + token);

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };
  const getResponse = await fetch(URL, requestOptions)
    .then((res) => res.json())
    .then(function (response) {
      console.log("GET CALL RESPOSE".response); // Will show you the status
      return response;
    });

  //IF TOKEN IS EXPIRED GET NEW TOKEN AN RE-RUN RESPONSE
  if (
    typeof getResponse.msg != "undefined" &&
    getResponse.msg == "Token has expired"
  ) {
    const newtoken = await getAuthToken();
    const headersNew = new Headers();
    var URL = authData.gen_base_url + endpoint;

    headersNew.append("Client-Key", authData.gen_client_key);
    headersNew.append(
      "Authorization",
      "Bearer " + newtoken[0].data["Authorization Key"],
    );
    const requestOptionsNew = {
      method: "GET",
      headers: headersNew,
      redirect: "follow",
    };

    const getResponseNew = await fetch(URL, requestOptionsNew)
      .then((res) => res.json())
      .then(function (response) {
        console.log("GET CALL RESPOSE", response); // Will show you the status
        return response;
      });
    return getResponseNew[0];
  }
  return getResponse[0];
};

export const postAPIRequest = async (endpoint, body) => {
  console.log("POST API START");
  var authData = await getAuthDetails();
  var token = authData.gen_access_token;
  if (!authData.gen_access_token) {
    var token = await getAuthToken();
    token = token[0].data["Authorization Key"];
  }
  var URL = authData.gen_base_url + endpoint;
  const headers = new Headers();
  headers.append("Client-Key", authData.gen_client_key);
  headers.append("Authorization", "Bearer " + token);
  headers.append("Content-Type", "application/json");
  const requestOptions = {
    method: "POST",
    headers: headers,
    body: body,
    redirect: "follow",
  };
  var res = "";
  await fetch(URL, requestOptions)
    .then(function (response) {
      res = response.text();
      return response;
    })
    .then((result) => console.log("POST API", result.status))
    .catch((error) => console.error(error));
  console.log("POST API END");
  return res;
};

export const deleteAPIRequest = async (endpoint, body) => {
  console.log("DELETE API START");
  var authData = await getAuthDetails();
  var URL = authData.gen_base_url + endpoint;
  const headers = new Headers();
  headers.append("Client-Key", authData.gen_client_key);
  headers.append("Authorization", "Bearer " + authData.gen_access_token);
  headers.append("Content-Type", "application/json");
  const requestOptions = {
    method: "DELETE",
    headers: headers,
    body: body,
    redirect: "follow",
  };
  var res = "";
  await fetch(URL, requestOptions)
    .then(function (response) {
      res = response.text();
      return response;
    })
    .then((result) => console.log("DELETE API", result.status))
    .catch((error) => console.error(error));
  console.log("DELETE API END");
  return res;
};

export const shopifyAPICall = async (resource, request, _session, params) => {
  console.log("shopifyAPICallSTART");
  var token = "";
  var my_shop = "";
  if (request) {
    const { session } = await authenticate.admin(request);
    const { shop, accessToken } = session;
    my_shop = shop;
    token = accessToken;
  } else {
    const { shop, accessToken } = _session;
    my_shop = shop;
    token = accessToken;
  }

  const myHeaders = new Headers();
  myHeaders.append("X-Shopify-Access-Token", token);
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  var res = "";
  await fetch(
    `https://${my_shop}/admin/api/${apiVersion}/${resource}.json?${params}`,
    requestOptions,
  )
    .then(function (response) {
      res = response.json();
      return response;
    })
    .then((result) => console.log("shopifyAPICall", result.status))
    .catch((error) => console.error(error));
  console.log("shopifyAPICall END");
  return res;
};

export const shopifyPutAPICall = async (
  resource,
  request,
  _session,
  params,
  body,
) => {
  console.log("shopifyPUTAPICallSTART");
  var token = "";
  var my_shop = "";
  if (request) {
    const { session } = await authenticate.admin(request);
    const { shop, accessToken } = session;
    my_shop = shop;
    token = accessToken;
  } else {
    const { shop, accessToken } = _session;
    my_shop = shop;
    token = accessToken;
  }

  const myHeaders = new Headers();
  myHeaders.append("X-Shopify-Access-Token", token);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(body);
  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  console.log("requestOptions", requestOptions);
  var res = "";
  await fetch(
    `https://${my_shop}/admin/api/${apiVersion}/${resource}.json?${params}`,
    requestOptions,
  )
    .then(function (response) {
      res = response.json();
      return response;
    })
    .then((result) => console.log("shopifyAPICall", result))
    .catch((error) => console.error(error));
  console.log("shopifyPUTAPICallSTART END");
  return res;
};

export const ShopifyGraphqlCall = async (session, query) => {
  console.log("grapql start");
  const { shop, accessToken } = session;
  const graphqlEndpoint = `https://${shop}/admin/api/${apiVersion}/graphql.json`;
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  console.log("grapql end ");
  return data;
};

const getAuthDetails = async () => {
  var data = [];
  var gen_base_url = await getRecomdoConfig({
    path: "gen_base_url",
  });
  var gen_access_key = await getRecomdoConfig({
    path: "gen_access_key",
  });
  var gen_access_secret = await getRecomdoConfig({
    path: "gen_access_secret",
  });
  var gen_client_key = await getRecomdoConfig({
    path: "gen_client_key",
  });
  var gen_access_token = await getRecomdoConfig({
    path: "gen_access_token",
  });
  data.push({
    gen_base_url: gen_base_url.value,
    gen_access_key: gen_access_key.value,
    gen_access_secret: gen_access_secret.value,
    gen_client_key: gen_client_key.value,
    gen_access_token: gen_access_token.value,
  });
  return data[0];
};
const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};
