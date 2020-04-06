// Protocol
ipcRenderer.on("protocol-to-songdetail", (event, info) => {
    console.log(info);
});

if(process.argv.length > 1) {
    if(process.argv[1].includes("spinshare-song")) {
        let songId = process.argv[1].replace("spinshare-song://", "").replace("/", "");
        NavigateToSongDetail(songId);
    }
}