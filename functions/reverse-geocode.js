const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, MY_SECRET_PROXY_KEY } = process.env;

  const authHeader = event.headers.authorization || '';
  
  // .trim()을 추가하여 앞뒤 공백을 모두 제거합니다.
  const receivedToken = (authHeader.split(' ')[1] || '').trim();
  const serverKey = (MY_SECRET_PROXY_KEY || '').trim();

  // 공백 제거 후 두 값을 비교하고, 빈 값인지도 확인합니다.
  if (!receivedToken || receivedToken !== serverKey) {
    console.log("!!! 인증 실패 !!!");
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }
  
  console.log("--- 인증 성공 ---");

  const coords = event.queryStringParameters.coords;
  if (!coords) {
    return { statusCode: 400, body: 'Coordinates are required' };
  }
  const naverApiUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${coords}&output=json`;
  try {
    const naverResponse = await fetch(naverApiUrl, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
      },
    });

    if (!naverResponse.ok) {
      const errorText = await naverResponse.text();
      console.error("Naver API 에러 내용:", errorText);
      return { statusCode: naverResponse.status, body: `Naver API Error: ${errorText}` };
    }

    const data = await naverResponse.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.error("Naver API 호출 중 심각한 에러 발생:", error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};