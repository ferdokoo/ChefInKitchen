// In-memory storage for cooking sessions
// Key: sessionId (IP or generated ID), Value: Session Object
const sessions = {};

/**
 * Create or retrieve a session
 * @param {string} id 
 * @returns {object} session
 */
const getSession = (id) => {
    if (!sessions[id]) {
        sessions[id] = {
            recipe: null,
            currentStepIndex: 0,
            history: [], // conversation history or action history
            isPaused: false
        };
    }
    return sessions[id];
};

module.exports = {
    sessions,
    getSession
};
