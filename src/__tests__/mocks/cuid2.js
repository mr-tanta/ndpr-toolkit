'use strict';

const TEST_ID = 'test-cuid';

const createId = () => TEST_ID;
const init = () => createId;
const getConstants = () => ({});
const isCuid = (value) => typeof value === 'string' && value.length > 0;

module.exports = { createId, init, getConstants, isCuid };
