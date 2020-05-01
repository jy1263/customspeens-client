<template>
    <section class="section-library">
        <SongRow :title="$t('library.installed.header')">
            <template v-slot:controls>
                <div class="item"></div>
                <div class="item" v-on:click="refreshLibrary()"><i class="mdi mdi-refresh"></i></div>
            </template>
            <template v-slot:song-list>
                <SongInstallItem />

                <SongLocalItem
                    v-for="song in librarySongs"
                    v-bind:key="song.detail.id"
                    v-bind="song" />
            </template>
        </SongRow>

        <DeleteOverlay v-if="showDeleteOverlay" v-bind:deleteFiles="deleteFiles" />
    </section>
</template>

<script>
    import fs from 'fs';
    import glob from 'glob';
    import path from 'path';

    import UserSettings from '@/modules/module.usersettings.js';
    import SRXD from '@/modules/module.srxd.js';

    import DeleteOverlay from '@/components/Overlays/DeleteOverlay.vue';
    import SongRow from '@/components/Song/SongRow.vue';
    import SongLocalItem from '@/components/Song/SongLocalItem.vue';
    import SongInstallItem from '@/components/Song/SongInstallItem.vue';

    export default {
        name: 'Library',
        data: function() {
            return {
                librarySongs: [],
                showDeleteOverlay: false,
                deleteFiles: []
            }
        },
        components: {
            SongRow,
            SongLocalItem,
            SongInstallItem,
            DeleteOverlay
        },
        mounted: function() {
            this.refreshLibrary();
            
            this.$on('delete', (file) => {
                this.$data.showDeleteOverlay = true;
                this.$data.deleteFiles = this.getConnectedFiles(file);
            });
            this.$on('deleteDeny', () => {
                this.$data.showDeleteOverlay = false;
                this.$data.deleteFiles = "";
            });
            this.$on('deleteConfirm', () => {
                this.$data.deleteFiles.forEach((file) => {
                    fs.unlinkSync(file);
                });
                this.refreshLibrary();
                this.$data.showDeleteOverlay = false;
                this.$data.deleteFiles = "";
            });
        },
        methods: {
            refreshLibrary: function() {
                let userSettings = new UserSettings();

                this.$data.librarySongs = [];
                
                // Load local .srtb
                glob(path.join(userSettings.get('gameDirectory'), "*.srtb"), (error, files) => {
                    files.forEach((file) => {
                        // Get Detail Data
                        let songDetail = this.getSongDetail(file);
                        let songCover = glob.sync(path.join(userSettings.get('gameDirectory'), "AlbumArt", songDetail.coverReference + ".*"))[0];
                        let songSpinShareReference = false;

                        if(file.split("/")[file.split("/").length - 1].replace(".srtb", "").includes("spinshare_")) {
                            songSpinShareReference = file.split("/")[file.split("/").length - 1].replace(".srtb", "");
                        }

                        if(songCover) {
                            songCover = "data:image/jpg;base64," + fs.readFileSync(songCover, { encoding: 'base64' });
                        }

                        let librarySong = {
                            file: file,
                            detail: songDetail,
                            cover: songCover,
                            isSpinShare: songSpinShareReference
                        };

                        this.$data.librarySongs.push(librarySong);
                    });
                });
            },
            getSongDetail: function(filePath) {
                let srtbContent = JSON.parse( fs.readFileSync(filePath) );
                let trackInfo = {};

                let stringValueContainers = srtbContent['largeStringValuesContainer'].values;

                stringValueContainers.forEach((stringValueContainer) => {
                    if(stringValueContainer.key == "SO_TrackInfo_TrackInfo") {
                        let rawTrackInfo = JSON.parse( stringValueContainer.val );
                        trackInfo = {
                            title: rawTrackInfo.title,
                            artist: rawTrackInfo.artistName,
                            charter: rawTrackInfo.charter,
                            coverReference: rawTrackInfo.albumArtReference.assetName
                        };
                    }
                });
                        
                return trackInfo;
            },
            getConnectedFiles: function(srtbFilePath) {
                let userSettings = new UserSettings();
                let srtbContent = JSON.parse( fs.readFileSync(srtbFilePath) );
                let connectedFiles = [];

                connectedFiles.push(srtbFilePath);

                let stringValueContainers = srtbContent['largeStringValuesContainer'].values;

                stringValueContainers.forEach((stringValueContainer) => {
                    if(stringValueContainer.key == "SO_TrackInfo_TrackInfo") {
                        let rawTrackInfo = JSON.parse( stringValueContainer.val );
                        let coverPath = glob.sync(path.join(userSettings.get('gameDirectory'), "AlbumArt", rawTrackInfo.albumArtReference.assetName + ".*"))[0];

                        if(coverPath) {
                            connectedFiles.push(coverPath);
                        }
                    }
                    if(stringValueContainer.key.includes("SO_ClipInfo")) {
                        let rawClipInfo = JSON.parse( stringValueContainer.val );
                        let clipPath = glob.sync(path.join(userSettings.get('gameDirectory'), "AudioClips", rawClipInfo.clipAssetReference.assetName + ".*"))[0];

                        if(clipPath) {
                            connectedFiles.push(clipPath);
                        }
                    }
                });

                return connectedFiles;
            }
        }
    }
</script>

<style scoped lang="less">
    section {
        padding: 50px;
    }
</style>