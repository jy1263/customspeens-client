const axios = require('axios');

class SHAPI {
    constructor() {
        this.apiBase = "http://localhost/www/customspeens-server/public/index.php/api/";
        this.supportedVersion = 1;
    }

    async ping() {
        let apiPath = this.apiBase + "ping";
        let supportedVersion = this.supportedVersion;

        return axios.get(apiPath)
        .then(function(response) {
            if(response.data.version !== supportedVersion) {
                throw new Error("Client is outdated!");
            }

            return response.data.data;
        }).catch(function(error) {
            throw new Error(error);
        });
    }

    async getAds() {
        let apiPath = this.apiBase + "ads";
        let supportedVersion = this.supportedVersion;

        return axios.get(apiPath)
        .then(function(response) {
            if(response.data.version !== supportedVersion) {
                throw new Error("Client is outdated!");
            }
            
            return response.data.data;
        }).catch(function(error) {
            throw new Error(error);
        });
    }

    async getNewSongs(_offset) {
        let apiPath = this.apiBase + "songs/new/" + _offset;
        let supportedVersion = this.supportedVersion;

        return axios.get(apiPath)
        .then(function(response) {
            if(response.data.version !== supportedVersion) {
                throw new Error("Client is outdated!");
            }
            
            return response.data.data;
        }).catch(function(error) {
            throw new Error(error);
        });
    }

    async getPopularSongs(_offset) {
        let apiPath = this.apiBase + "songs/popular/" + _offset;
        let supportedVersion = this.supportedVersion;

        return axios.get(apiPath)
        .then(function(response) {
            if(response.data.version !== supportedVersion) {
                throw new Error("Client is outdated!");
            }
            
            return response.data.data;
        }).catch(function(error) {
            throw new Error(error);
        });
    }

    async getSongDetail(_songId) {
        let apiPath = this.apiBase + "song/" + _songId;
        let supportedVersion = this.supportedVersion;

        return axios.get(apiPath)
        .then(function(response) {
            if(response.data.version !== supportedVersion) {
                throw new Error("Client is outdated!");
            }
            
            return response.data.data;
        }).catch(function(error) {
            throw new Error(error);
        });
    }
}

module.exports = SHAPI;