import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, serverTimestamp, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


const firebaseConfig = {
  apiKey: "AIzaSyBsel1yqKKa1_MabqthviwqVXyC24vo0Tk",
  authDomain: "jamspace-c7333.firebaseapp.com",
  projectId: "jamspace-c7333",
  storageBucket: "jamspace-c7333.firebasestorage.app",
  messagingSenderId: "988248857010",
  appId: "1:988248857010:web:fbc04a0dd56668469d6cab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);




lucide.createIcons();

tailwind.config = {
    theme: {
    extend: {
        colors: {
            'bg-primary': '#000000',
            'bg-secondary': '#0a0a0a',
            'bg-card': '#1A1A1A',
            'text-muted': '#9ca3af',
        },
        fontFamily: {
            'host': ['Host Grotesk', 'sans-serif'],
            'inter': ['Inter', 'sans-serif'],
        }
    }
    }
}

document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth/2 - e.clientX);
    const y = (window.innerHeight/2 - e.clientY);

    document.querySelectorAll(".card-wrapper").forEach(layer => {
        const speed = layer.getAttribute("data-speed");
        const moveX = (x * speed) / 100;
        const moveY = (y * speed) / 100;

        layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
    })
});


const playlistModalBtn = document.getElementById("cta-main");
const createPlaylistModal = document.querySelector(".create-playlist-form");
const closePlaylistModalBtn = document.querySelector(".close-create-playlist-btn");
const playlistNameInput = document.getElementById("playlistNameInput");


playlistModalBtn.addEventListener("click", () => {
    createPlaylistModal.style.display = "flex";
});

closePlaylistModalBtn.addEventListener("click", () => {
    createPlaylistModal.style.display = "none";
    playlistNameInput.value = "";
});


function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }

    return text;
}

const playlistNameError = document.querySelector(".playlistNameError");
const createPlaylistBtn = document.querySelector(".create-playlist-btn");

const createSection = document.querySelector(".create-section");

const playlistNameDisplay = document.getElementById("playlistname-display");
const roomCodeDisplay = document.getElementById("room-code");

createPlaylistBtn.addEventListener("click", async () => {
    const playlistName = playlistNameInput.value;

    if (playlistName === "") {
        playlistNameError.textContent = "Playlist name cannot be empty";
    } else {
        
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            await setDoc(doc(db, 'rooms', roomCode), {
                name: playlistName,
                code: roomCode,
                songs: [],
                createdAt: serverTimestamp()
            });

            window.currentRoomCode = roomCode;

            createPlaylistModal.style.display = "none";
            createSection.style.display = "block";
            playlistNameDisplay.textContent = playlistName;
            roomCodeDisplay.textContent = roomCode;

            listenToPlaylist(roomCode)

        } catch (error) {
            console.error("Error Creating Room:", error);
        }
    }
});


let accessToken = "";

async function getSpotifyToken() {
    const response = await fetch('http://localhost:3000/api/token');
    const data = await response.json();
    accessToken = data.access_token;
    console.log('Token received:', accessToken);
}

getSpotifyToken();



async function searchSongs(query) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    
    const data = await response.json();
    return data.tracks.items;
}

const searchSongInput = document.getElementById("searchSongsInput");
const searchSongResult = document.getElementById("searchResults");

const leaveRoomBtn = document.getElementById("leaveRoom");
const doneBtn = document.getElementById("doneBtn");


const infoModal = document.getElementById("info-modal");

leaveRoomBtn.addEventListener('click', () => {
    infoModal.style.display = "block";
    infoModal.innerHTML = `
        <div class="inf0-msg w-[100%] md:-[500px] p-6 rounded shadow absolute">
            <p class="text-center text-gray-300">
                if you leave, this playlist would be deleted
                are you sure you want to leave?
            </p>

            <div class="confirm-buttons flex mt-6 items-center justify-center  gap-6">
                <button class="cta cta-sub" id="leave-no">No</button>
                <button class="cta cta-main" id="leave-yes">Yes</button>
            </div>
        </div>
    `;

    const leaveNoBtn = infoModal.querySelector("#leave-no");
    const confirmDeleteBtn = infoModal.querySelector("#leave-yes") ;
    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            if (window.currentRoomCode) {
                await deleteDoc(doc(db, 'rooms', window.currentRoomCode));
                
                window.currentRoomCode = null;
                createSection.style.display = "none";
                
                alert('Playlist deleted successfully');
            } else {
                createSection.style.display = "none";
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Failed to delete playlist');
        }
    });

    leaveNoBtn.addEventListener('click', () => {
        infoModal.style.display = "none";
        infoModal.innerHTML = '';
    });
})

searchSongInput.addEventListener("keydown", async (e) => {
    const query = searchSongInput.value.trim();

    if (query === "" && e.key === 'Enter') {
        console.log("This shit is empty")
    } else if (e.key === 'Enter') {
        searchSongResult.innerHTML = `
            <div class="flex items-center justify-center absolute w-full">
                <p class="text-center text-gray-300 py-8">Loading...</p>
            </div>
        `

        const songs = await searchSongs(query);
        displaySearchResults(songs);
    }
});

const emptyBtn = document.getElementById("empty-search-input");
searchSongInput.addEventListener("input", () => {
    emptyBtn.style.display = "block";
});

emptyBtn.addEventListener('click', () => {
    searchSongInput.value = "";
});



function displaySearchResults(songs) {
    searchSongResult.innerHTML = '';
    
    songs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.classList.add('search-result-card');

        const truncatedName = truncateText(song.name, 20);
        
        songCard.innerHTML = `
            <div class="left">
                <img src="${song.album.images[2]?.url || 'placeholder.jpg'}" alt="${song.name}">
                <div class="song-info flex-1 min-w-0">
                    <h4 class="truncate">${truncatedName}</h4>
                    <p class="text-sm">${song.artists[0].name}</p>
                </div>
            </div>
            <button class="add-btn flex-shrink-0" data-song='${JSON.stringify(song)}'>
                <i data-lucide="plus"></i>
            </button>
        `;

        const addBtn = songCard.querySelector('.add-btn');
        addBtn.addEventListener('click', async () => {
            const originalHTML = addBtn.innerHTML;
            addBtn.disabled = true;
            addBtn.innerHTML = '<i data-lucide="check"></i>';
            lucide.createIcons();
            
            await addSongToPlaylist({
                id: song.id,
                name: song.name,
                artist: song.artists[0].name,
                album: song.album.name,
                image: song.album.images[2]?.url || '',
                votes: 0
            });

            setTimeout(() => {
                addBtn.disabled = false;
                addBtn.innerHTML = originalHTML;
                lucide.createIcons();
            }, 1000);
        });
        
        searchSongResult.appendChild(songCard);
    });
    
    lucide.createIcons();
}

async function addSongToPlaylist(song) {
    if (!window.currentRoomCode) {
        return;
    }

    try {
        const roomRef = doc(db, 'rooms', window.currentRoomCode);

        await updateDoc(roomRef, {
            songs: arrayUnion(song)
        });

    } catch (error) {
        console.error("Error adding song:", error);
    }
}

function listenToPlaylist(roomCode) {
    const roomRef = doc(db, 'rooms', roomCode);

    onSnapshot(roomRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            displayPlaylist(data.songs || []);
        }
    })
}

function displayPlaylist(songs) {
    const playlistContainer = document.getElementById("playlistSongs");

    if (songs.length === 0) {
        playlistContainer.innerHTML= `
            <div class="flex items-center justify-center absolute w-full">
                <p class="text-gray-300">No songs added yet</p>
            </div>
        `;
        return;
    }

    playlistContainer.innerHTML = '';

    songs.forEach((song) => {
        const songCard = document.createElement('div');
        songCard.classList.add('search-result-card');

        const truncatedName = truncateText(song.name, 25);

        songCard.innerHTML =`
            <div class="left">
                <img src="${song.image}" alt="${song.name}">
                <div class="song-info">
                    <h4>${truncatedName}</h4>
                    <p class="text-sm">${song.artist}</p>
                </div>
            </div>
            <button class="remove-btn">
                <i data-lucide="minus"></i>
            </button>
        `;

        const removeBtn = songCard.querySelector(".remove-btn");
        removeBtn.addEventListener("click", () => {
            removeSongFromPlaylist(song.id);
        })

        playlistContainer.appendChild(songCard);
    });

    lucide.createIcons();
}


async function removeSongFromPlaylist(songId) {
    if (!window.currentRoomCode) {
        return;
    }

    try {
        const roomRef = doc(db, 'rooms', window.currentRoomCode)
        const roomSnap =    await getDoc(roomRef);

        if (roomSnap.exists()) {
            const currentSongs = roomSnap.data().songs || [];
            const updatedSongs = currentSongs.filter(song => song.id !== songId);

            await updateDoc(roomRef, {
                songs: updatedSongs
            });
        }
    } catch (error) {
        console.error("Error removing song:", error)
    }
};





const searchTabBtn = document.getElementById("searchTabBtn");
const playlistTabBtn = document.getElementById("playlistTabBtn");

searchTabBtn.addEventListener("click", () => {
    document.getElementById("playlistSongs").style.display = "none";
    document.getElementById("searchResults").style.display = "flex";
    searchTabBtn.style.color = "var(--lime)";
    playlistTabBtn.style.color = "#f8f8f8";
});

playlistTabBtn.addEventListener('click', () => {
    document.getElementById("searchResults").style.display = "none";
    document.getElementById("playlistSongs").style.display = "flex";
    playlistTabBtn.style.color = "var(--lime)";
    searchTabBtn.style.color = "#f8f8f8";
});



const mainSection = document.getElementById("mainSection");
const browseSection = document.getElementById("browse-section");
const joinRoomSection = document.getElementById("joinRoomSection");
const browseSectionBtn = document.querySelectorAll("#browse-section-link");
const homeSectionBtn = document.querySelectorAll("#home-section-link");
const browseResults = document.getElementById("browse-container");
const browseSearchInput = document.getElementById("browse-playlist-input");
const browseCta = document.getElementById("cta-browse");

browseCta.addEventListener('click', async () => {
    browseSection.style.display = "block";
    await loadAllPlaylists()
})

browseSectionBtn.forEach((browseLink) => {
    browseLink.addEventListener('click', async () => {
        mainSection.style.display = 'none';
        createSection.style.display = 'none';
        browseSection.style.display = 'block';
        await loadAllPlaylists()
    })
})

homeSectionBtn.forEach((homeLink) => {
    homeLink.addEventListener('click', () => {
        browseSection.style.display = "none";
        createSection.style.display = "none";
        joinRoomSection.style.display = "none";
        mainSection.style.display = "flex";
    })
})


const emptyBrowseInput = document.getElementById("empty-browse-input")
browseSearchInput.addEventListener('input', () => {
    if (browseSearchInput.value.length > 1) {
        emptyBrowseInput.style.display = "block";
    } else {
        emptyBrowseInput.style.display = "none";
    }
});

emptyBrowseInput.addEventListener('click', () => {
    browseSearchInput.value = "";
})





async function loadAllPlaylists() {
    browseResults.innerHTML = `
        <div class="flex items-center absolute justify-center w-full ">
            <p class="text-center w-full text-gray-300">Loading Playlist...</p>
        </div>
    `

    try {
        const querySnapshot = await getDocs(collection(db, 'rooms'));
        const playlists = [];
        
        querySnapshot.forEach((doc) => {
            playlists.push({ id: doc.id, ...doc.data() });
        });
        
        displayBrowsePlaylists(playlists);
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
};

function displayBrowsePlaylists(playlists) {
    if (playlists.length === 0) {
        browseResults.innerHTML = '<p class="text-center col-span-3">No playlists found</p>';
        return;
    }
    
    browseResults.innerHTML = '';
    
    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card bg-bg-card rounded-lg pt-4 px-6 pb-8 relative';
        
        const likeCount = playlist.likes || 0;
        const likedByUser = checkIfLiked(playlist.code);
        
        playlistCard.innerHTML = `
            <h3 class="text-xl font-host mb-2">${playlist.name}</h3>
            <p class="text-gray-400 text-sm mb-4">Code: ${playlist.code}</p>
            <p class="text-gray-500 text-sm mb-4">${playlist.songs?.length || 0} songs</p>
            <div class="mt-4 mb-8">
                ${playlist.songs?.slice(0, 3).map(song => `
                    <img src="${song.image}" class="inline-block w-12 h-12 rounded" alt="${song.name}">
                `).join('') || '<p class="text-gray-500">No songs yet</p>'}
            </div>
            
            <div class="flex flex-col md:flex-row w-full items-start md:items-center md:gap-6 mt-4 absolute bottom-[1%]">
                <button class="like-btn flex gap-2 items-center justify-center flex-1 rounded" data-code="${playlist.code}">
                    <i data-lucide="heart" class="${likedByUser ? 'fill-current' : ''}"></i>
                    <span class="like-count">${likeCount}</span>
                </button>
                <button class="add-to-spotify-btn w-full flex px-0 md:px-4 py-2" data-code="${playlist.code}">
                    Add to Spotify
                </button>
            </div>
        `;
        
        const likeBtn = playlistCard.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            likePlaylist(playlist.code);
        });
        
        const addToSpotifyBtn = playlistCard.querySelector('.add-to-spotify-btn');
        addToSpotifyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await addToSpotify(playlist);
        });
        
        playlistCard.addEventListener('click', () => {
            showPlaylistDetail(playlist)
        });
        
        browseResults.appendChild(playlistCard);
    });
    
    lucide.createIcons();
}

doneBtn.addEventListener('click', () => {
    infoModal.style.display = "block";
    infoModal.innerHTML = `
        <div class="info-msg w-[100%] md:w-[600px] p-6 rounded shadow-md absolute">
            <h2 class="text-2xl text-center mb-2">Your playlist has been created successfully</h2>
            <p class="text-center text-gray-300">
                Share the link and startbuilding the perfect vibe 
                together in real time
            </p>

            <div class="flex item-center justify-center w-full">
                <button class="cta cta-main mt-6 flex items-center justify-center">Got it</button>
            </div>
        </div>
    `;

    const confirmDone = infoModal.querySelector(".cta");
    confirmDone.addEventListener('click', () => {
        createSection.style.display = "none";
        infoModal.style.display = "none";
        browseSection.style.display = "none";
        joinRoomSection.style.display = "none";
        mainSection.style.display = "flex";
    })
});




const playlistDetailModal = document.querySelector('.playlist-detail-modal');
const closeDetailModal = document.querySelector('.close-detail-modal');
const playlistDetailOverlay = document.getElementById('playlistDetailOverlay');

let currentDetailPlaylist = null;

closeDetailModal.addEventListener('click', () => {
    playlistDetailModal.style.display = 'none';
});

playlistDetailOverlay.addEventListener('click', () => {
    playlistDetailModal.style.display = 'none';
});

function showPlaylistDetail(playlist) {
    currentDetailPlaylist = playlist;
    
    document.getElementById('detailPlaylistName').textContent = playlist.name;
    document.getElementById('detailPlaylistCode').textContent = `Room Code: ${playlist.code}`;
    
    const likeCount = playlist.likes || 0;
    const likedByUser = checkIfLiked(playlist.code);
    
    const detailLikeBtn = document.querySelector('.detail-like-btn');
    const detailLikeCount = document.querySelector('.detail-like-count');
    const detailAddSpotifyBtn = document.querySelector('.detail-add-spotify-btn');
    
    detailLikeCount.textContent = likeCount;
    
    
    detailLikeBtn.onclick = async () => {
        await likePlaylist(playlist.code);
        const updatedSnap = await getDoc(doc(db, 'rooms', playlist.code));
        if (updatedSnap.exists()) {
            const updatedPlaylist = { id: updatedSnap.id, ...updatedSnap.data() };
            showPlaylistDetail(updatedPlaylist);
        }
    };
    
    detailAddSpotifyBtn.onclick = async () => {
        await addToSpotify(playlist);
    };
    
    displayDetailSongs(playlist.songs || []);
    
    playlistDetailModal.style.display = 'block';
    lucide.createIcons();
}

function displayDetailSongs(songs) {
    const container = document.getElementById('detailSongsList');
    
    if (songs.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">No songs in this playlist</p>';
        return;
    }
    
    container.innerHTML = '';
    
    songs.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'flex items-center gap-4 p-4 detail-song-card rounded-lg';
        
        const truncatedName = truncateText(song.name, 40);
        const truncatedArtist = truncateText(song.artist, 30);
        
        songCard.innerHTML = `
            <span class="text-2xl text-gray-500 w-8">${index + 1}</span>
            <img src="${song.image}" class="w-16 h-16 rounded" alt="${song.name}">
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold">${truncatedName}</h4>
                <p class="text-sm text-gray-400">${truncatedArtist}</p>
            </div>
        `;
        
        container.appendChild(songCard);
    });
    
    lucide.createIcons();
}





browseSearchInput.addEventListener('keydown', async (e) => {
    const searchTerm = browseSearchInput.value.trim().toLowerCase();

    if (e.key === "Enter" && searchTerm === "") {
        await loadAllPlaylists();
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'rooms'));
        const playlists = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.name.toLowerCase().includes(searchTerm) || data.code.toLowerCase().includes(searchTerm)) {
                playlists.push({ id: doc.id, ...data });
            }
        });
        
        displayBrowsePlaylists(playlists);
    } catch (error) {
        console.error("Error searching:", error);
    }
});

function viewPlaylistDetails (code) {
    alert(`Viewing Playlist: ${code}`)
}





// roomCode functionality
const otpBoxes = document.querySelectorAll('.otp-box');

otpBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        const value = e.target.value;
        
        if (value.length === 1 && index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus();
        }
    });
    
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            otpBoxes[index - 1].focus();
        }
    });
    
    box.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6);
        
        pasteData.split('').forEach((char, i) => {
            if (otpBoxes[i]) {
                otpBoxes[i].value = char;
            }
        });
        
        const lastFilledIndex = Math.min(pasteData.length, otpBoxes.length) - 1;
        otpBoxes[lastFilledIndex].focus();
    });
});

function getOTPValue() {
    return Array.from(otpBoxes).map(box => box.value).join('');
}






const joinRoomBtn = document.getElementById("join-room-btn");
const joinRoomError = document.getElementById("roomCodeError");
const otpBox = document.querySelectorAll(".otp-box");

joinRoomBtn.addEventListener('click', async () => {
    const roomCode = getOTPValue().toUpperCase();

    if (roomCode.length !== 6) {
        joinRoomError.textContent = "Please enter a complete room code";
        return;
    }

    try {
        const roomRef = doc(db, 'rooms', roomCode);
        const roomSnap = await getDoc(roomRef);
        
        if (roomSnap.exists()) {
            const roomData = roomSnap.data();
            
            window.currentRoomCode = roomCode;
            
            browseSection.style.display = 'none';
            joinRoomSection.style.display = 'none';
            createSection.style.display = 'block';
            playlistNameDisplay.textContent = roomData.name;
            roomCodeDisplay.textContent = roomCode;
            
            listenToPlaylist(roomCode);
            
            otpBox.forEach((box) => {
                box.value = "";
            })
            joinRoomError.textContent = '';
        } else {
            joinRoomError.textContent = "Room not found. Check the code and try again";
        } 
    } catch (error) {
        console.error("Error joinning room:", error);
        joinRoomError.textContent = "Failed to join Room. try again later";
    }
});

function showJoinRoomSection () {
    joinRoomSection.style.display = "block";
    joinRoomSection.style.zIndex = '1000';
}


const joinSectionLinkBtn = document.querySelectorAll("#join-section-link");


joinSectionLinkBtn.forEach((joinLink) => {
    joinLink.addEventListener('click', () => {
        showJoinRoomSection();
        browseSection.style.display = "none";
        createSection.style.display = "none";
        mainSection.style.display = "none";
    })
})


gsap.from(".main-text", {
    opacity: 0,
    y: 10,
    ease: "power2.out",
    delay: 0.6
});

gsap.from(".sub-text", {
    opacity: 0,
    ease: "power2.out",
    delay: 0.8
});

gsap.from(".cta", {
    opacity: 0,
    y:10,
    ease: "power2.out",
    delay: 0.8,
    stagger: 0.3,
})

gsap.from(".floating-element", {
    opacity: 0,
    scale: 1.5,
    ease: "power2.inOut",
    delay: 0.2,
})





function checkIfLiked(code) {
    const liked = JSON.parse(localStorage.getItem('likedPlaylists') || '[]');
    return liked.includes(code);
}

async function likePlaylist(code) {
    const liked = JSON.parse(localStorage.getItem('likedPlaylists') || '[]');
    
    try {
        const roomRef = doc(db, 'rooms', code);
        const roomSnap = await getDoc(roomRef);
        
        if (roomSnap.exists()) {
            const currentLikes = roomSnap.data().likes || 0;
            
            if (liked.includes(code)) {
                const updated = liked.filter(c => c !== code);
                localStorage.setItem('likedPlaylists', JSON.stringify(updated));
                
                await updateDoc(roomRef, {
                    likes: currentLikes - 1
                });
            } else {
                liked.push(code);
                localStorage.setItem('likedPlaylists', JSON.stringify(liked));
                
                await updateDoc(roomRef, {
                    likes: currentLikes + 1
                });
            }
            
            await loadAllPlaylists();
        }
    } catch (error) {
        console.error('Error liking playlist:', error);
    }
}

// Skip Spotify export for now - just copy tracklist instead
async function addToSpotify(playlist) {
    if (!playlist.songs || playlist.songs.length === 0) {
        alert('This playlist has no songs to export');
        return;
    }
    
    try {
        const tracklist = playlist.songs.map((song, index) => 
            `${index + 1}. ${song.name} - ${song.artist}`
        ).join('\n');
        
        await navigator.clipboard.writeText(tracklist);
        alert(`Tracklist copied to clipboard!\n\nYou can now paste it anywhere or manually create the playlist on Spotify.`);
    } catch (error) {
        console.error('Error copying tracklist:', error);
        
        const tracklist = playlist.songs.map((song, index) => 
            `${index + 1}. ${song.name} - ${song.artist}`
        ).join('\n');
        
        prompt('Copy this tracklist:', tracklist);
    }
}
