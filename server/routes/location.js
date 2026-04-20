const express = require('express');
const router = express.Router();
const locationApi = require('../utils/location');

router.get('/current', async (req, res) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // 只保留 IPv4 地址，高德 IP 定位只支持 IPv4
    if (ip && ip.includes(':')) {
      // 如果是 IPv6，尝试提取 IPv4 部分（如 ::ffff:127.0.0.1）
      const match = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
      if (match) {
        ip = match[1];
      } else {
        // 其他 IPv6 情况不传 IP，让高德使用服务器 IP
        ip = '';
      }
    }
    const result = await locationApi.getCityAndWeather(ip);

    if (result.success) {
      res.json({
        success: true,
        location: result.location,
        weather: result.weather
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('获取定位和天气信息出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.get('/location', async (req, res) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // 只保留 IPv4 地址，高德 IP 定位只支持 IPv4
    if (ip && ip.includes(':')) {
      const match = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
      if (match) {
        ip = match[1];
      } else {
        ip = '';
      }
    }
    const result = await locationApi.getCityByIP(ip);

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('获取定位信息出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

router.get('/weather/:adcode', async (req, res) => {
  try {
    const { adcode } = req.params;
    const extensions = req.query.extensions || 'all';

    const result = await locationApi.getWeatherInfo(adcode, extensions);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('获取天气信息出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
