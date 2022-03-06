const checkSWUIDPattern = (swuid) => {
    return /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/gis.test(swuid);
}

const checkIdPattern = (id) => {
    return /^[a-fA-F0-9]{24}$/gis.test(id);
}

module.exports = {checkSWUIDPattern, checkIdPattern}