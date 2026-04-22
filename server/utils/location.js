const axios = require('axios');

const TENCENT_MAP_API_KEY = process.env.TENCENT_MAP_API_KEY;

const locationApi = {
  isPrivateIP(ip) {
    if (!ip) return false;
    // 检测是否为局域网IP
    const privateRanges = [
      /^10\./,                    // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
      /^192\.168\./,               // 192.168.0.0/16
      /^127\./                     // 127.0.0.0/8 (环回地址)
    ];
    return privateRanges.some(range => range.test(ip));
  },

  async getCityByIP(ip) {
    try {
      // 如果是局域网IP，使用固定的公网IP作为保底方案
      const finalIP = this.isPrivateIP(ip) ? '111.206.145.41' : ip;
      const url = `https://apis.map.qq.com/ws/location/v1/ip`;
      const params = {
        key: TENCENT_MAP_API_KEY,
        ip: finalIP || ''
      };
      console.log('[定位] 请求IP:', finalIP);
      const res = await axios.get(url, { params, timeout: 10000 });
      console.log('[定位] 响应:', JSON.stringify(res.data));

      if (res.data.status === 0) {
        const result = res.data.result;
        return {
          success: true,
          province: result.ad_info?.province,
          city: result.ad_info?.city,
          district: result.ad_info?.district,
          adcode: result.ad_info?.adcode,
          location: {
            lat: result.location.lat,
            lng: result.location.lng
          }
        };
      } else {
        return {
          success: false,
          message: res.data.message || 'IP定位失败'
        };
      }
    } catch (error) {
      console.error('[定位] 获取定位信息出错:', error.message);
      return {
        success: false,
        message: '获取定位信息出错'
      };
    }
  },

  async getWeatherInfo(adcode) {
    try {
      const url = `https://apis.map.qq.com/ws/weather/v1/`;
      const params = {
        key: TENCENT_MAP_API_KEY,
        adcode: adcode,
        type: 'future',
        get_md: 1
      };
      console.log('[天气] 请求参数:', params);
      const res = await axios.get(url, { params, timeout: 15000 });
      console.log('[天气] 响应:', JSON.stringify(res.data));

      if (res.data.status === 0) {
        const forecast = res.data.result.forecast[0];
        return {
          success: true,
          data: {
            city: forecast.city,
            adcode: forecast.adcode,
            province: forecast.province,
            update_time: forecast.update_time,
            casts: forecast.infos.map(item => ({
              date: item.date,
              week: item.week,
              dayweather: item.day.weather,
              daytemp: item.day.temperature.toString(),
              daywind: item.day.wind_direction + item.day.wind_power,
              dayhumidity: item.day.humidity,
              nightweather: item.night.weather,
              nighttemp: item.night.temperature.toString(),
              nightwind: item.night.wind_direction + item.night.wind_power,
              nighthumidity: item.night.humidity
            }))
          }
        };
      } else {
        return {
          success: false,
          message: res.data.message || '天气查询失败'
        };
      }
    } catch (error) {
      console.error('[天气] 获取天气信息出错:', error.message);
      return {
        success: false,
        message: '获取天气信息出错'
      };
    }
  },

  async getCityAndWeather(ip) {
    try {
      console.log('[定位和天气] 输入IP:', ip);
      const location = await this.getCityByIP(ip);
      console.log('[定位和天气] 定位结果:', location);

      if (!location.success || !location.adcode) {
        console.log('[定位和天气] 定位失败:', location);
        return {
          success: false,
          message: location.message || '无法获取城市信息'
        };
      }

      console.log('[定位和天气] 开始查询天气，adcode:', location.adcode);
      const weather = await this.getWeatherInfo(location.adcode);
      console.log('[定位和天气] 天气结果:', weather);

      const result = {
        success: true,
        location: {
          province: location.province,
          city: location.city,
          adcode: location.adcode
        },
        weather: weather.success ? weather.data : null
      };
      console.log('[定位和天气] 最终返回:', result);
      return result;
    } catch (error) {
      console.error('[定位和天气] 获取城市和天气信息出错:', error.message);
      return {
        success: false,
        message: '获取城市和天气信息出错'
      };
    }
  }
};

module.exports = locationApi;
