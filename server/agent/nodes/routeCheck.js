/**
 * 条件路由：判断是否包含图片
 * 有图片 → "analyzeImage"
 * 无图片 → "gatherContext"
 */
function routeCheck(state) {
    if (state.images && state.images.length > 0) {
        return 'analyzeImage';
    }
    return 'gatherContext';
}

module.exports = routeCheck;
