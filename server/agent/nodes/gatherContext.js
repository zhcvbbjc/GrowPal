const { getLocationWeather } = require('../tools/locationWeather');

/**
 * 获取用户位置和天气信息，写入 state
 */
async function gatherContext(state) {
    const { userIp } = state;

    if (!userIp) {
        console.warn('[节点:gatherContext] 无用户 IP，跳过位置天气获取');
        return { ...state, locationInfo: null, weatherInfo: null };
    }

    const { locationInfo, weatherInfo } = await getLocationWeather(userIp);
    return { ...state, locationInfo, weatherInfo };
}

module.exports = gatherContext;
