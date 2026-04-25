const locationApi = require('../../utils/location');

/**
 * 根据用户 IP 获取位置和天气信息
 * @param {string} ip - 用户 IP 地址
 * @returns {Promise<{ locationInfo: object|null, weatherInfo: object|null }>}
 */
async function getLocationWeather(ip) {
    try {
        const result = await locationApi.getCityAndWeather(ip);
        if (!result.success) {
            console.warn('[工具] 获取位置天气失败:', result.message);
            return { locationInfo: null, weatherInfo: null };
        }
        return {
            locationInfo: result.location || null,
            weatherInfo: result.weather || null
        };
    } catch (err) {
        console.error('[工具] 位置天气查询异常:', err.message);
        return { locationInfo: null, weatherInfo: null };
    }
}

module.exports = { getLocationWeather };
