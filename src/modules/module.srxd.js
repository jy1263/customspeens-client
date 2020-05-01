const glob = require('glob');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const unzipper = require('unzipper');
const uniqid = require('uniqid');
const { app } = require('electron').remote;
const UserSettings = require('./module.usersettings');

class SRXD {
    constructor() {
        this.backupLocation = "";
        this.srtbLocation = "";
        this.songTrackInfo = {};
        this.songLocation = "";

        this.userSettings = new UserSettings();
    }

    // Extract a local backup folder
    async extractBackup(filePath, fileName) {
        if(this.backupLocation != "") {
            console.log("Unload previous Backup.");
            this.unloadBackup();
        }
    
        console.log("Extracting Backup.");
    
        this.backupLocation = path.join(app.getPath('temp'), "extract-" + uniqid());
        console.info(this.backupLocation);
    
        // Unzip to temp/CustomSpeens/Song
        await fs.createReadStream(filePath).pipe(unzipper.Extract({ path: this.backupLocation })).promise();
    
        // Find SRTB & OGG files
        let srtbFilesInBackupLocation = this.getFilesFromPath(this.backupLocation, ".srtb");
    
        if(srtbFilesInBackupLocation.length < 1) {
            console.error("No SRTB file found in backup.");
            return false;
        }
    
        // Load SRTB file
        this.srtbLocation = path.join(this.backupLocation, srtbFilesInBackupLocation[0]);
        let srtbFile = JSON.parse( fs.readFileSync(this.srtbLocation) );
        let songTrackInfo = "";

        srtbFile.largeStringValuesContainer.values.forEach(function(value) {
            if(value.key == "SO_TrackInfo_TrackInfo") {
                songTrackInfo = value.val;
            }
        });

        this.songTrackInfo = songTrackInfo;
    
        // Load OGG file
        let OggFilePath = fs.existsSync(path.join(this.backupLocation, "AudioClips"), ".ogg")
        if (fs.existsSync(OggFilePath)) {
            let oggFilesInBackupLocation = this.getFilesFromPath(OggFilePath);
            this.songLocation = path.join(this.backupLocation, oggFilesInBackupLocation[0]);
                
        // TODO: Backup Validation
        return this.backupLocation;
        }
        else{
            return this.backupLocation;
        }
    }

    async unloadBackup() {
        // Remove temp files
        console.log("Removing Backup Folder: " + this.backupLocation);
        try {
            rimraf(this.backupLocation, function() { console.log("Removed backup folder."); });
        } catch(error) {
            console.error(error);
        }
    
        // Reset vars
        this.backupLocation = "";
        this.srtbLocation = "";
        this.songTrackInfo = {};
        this.songLocation = "";
    }

    getSongDetail(rootPath, songPath) {
        let srtbPath = path.join(rootPath, songPath);
        let srtbFile = JSON.parse( fs.readFileSync(srtbPath) );
        let songTrackInfo = "";
        let songOggInfo = "";

        srtbFile.largeStringValuesContainer.values.forEach(function(value) {
            if(value.key == "SO_TrackInfo_TrackInfo") {
                songTrackInfo = JSON.parse( value.val );
            }
            if(value.key == "SO_ClipInfo_ClipInfo_0") {
                songOggInfo = JSON.parse( value.val );
            }
        });

        return [songTrackInfo, this.getSongCover(songTrackInfo.albumArtReference.assetName), this.getSongAssetDirectory(songOggInfo.clipAssetReference.assetName, "AudioClips"), this.getSongAssetDirectory(songTrackInfo.albumArtReference.assetName, "AlbumArt"), srtbPath];
    }

    // Used to find files by file extension
    // by https://stackoverflow.com/a/52024318
    getFilesFromPath(path, extension) {
        let dir = fs.readdirSync( path );
        return dir.filter( elm => elm.match(new RegExp(`.*\.(${extension})$`, 'ig')));
    }
    getLocalSongs(path) {
        let dir = fs.readdirSync( path );
        return dir.filter( elm => elm.match(new RegExp(`.*\.srtb$`, 'ig')));
    }
    getFileExtension(fileName, filePath){
        let filePathJoined = path.join(filePath, fileName);
        let files = glob.sync(filePathJoined+".*");
        if (files[0] != undefined){return [path.parse(files[0]).base];}
        else {return [];}
    }
    getSongCover(fileName) {
        let fileExtension = this.getFileExtension(fileName, path.join(this.userSettings.get('gameDirectory'), "AlbumArt") );
    
        if(fileExtension.length > 0) {
            let finalPath = path.join(this.userSettings.get('gameDirectory'), "AlbumArt", fileExtension[0]);
    
            let base64Data = "data:image/jpg;base64," + fs.readFileSync(finalPath, { encoding: 'base64' });
        
            return base64Data;
        } else {
            return "";
        }
    }
    
    getSongTrackInfo() {
        return this.songTrackInfo;
    }

    //Gets directory of files to delete
    getSongAssetDirectory(fileName, fileType) {
        let fileExtension = this.getFileExtension(fileName, path.join(this.userSettings.get('gameDirectory'), fileType));
        if (fileExtension.join() != '') {
        let finalPath = path.join(this.userSettings.get('gameDirectory'), fileType, fileExtension.join());
        return finalPath;
        }
        else {return fileName;}        
    }
    //Deletes Files
    deleteFiles(songDetail) {
        let deleteFiles = [songDetail[2], songDetail[3], songDetail[4]];
            deleteFiles.forEach(function(file) {
                try{
                    let foundFiles = glob.sync(file);
                    if(foundFiles.length > 0) {
                        fs.unlinkSync(foundFiles[0]);
                    }
                }
                catch(err){}
        });
    }
}

module.exports = SRXD;
