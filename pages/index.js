import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
	const CLIENT_ID = "98f0b93b224645efb38fe8dcfbdf712d"
	const REDIRECT_URI = "https://spotify-music-api-pi.vercel.app/"
	// const REDIRECT_URI = "http://localhost:3000/"
	const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
	const RESPONSE_TYPE = "token";
	const SPACE_DELIMITER = "%20"
	const SCOPES = ["user-library-read", "user-read-currently-playing", "user-top-read", "user-follow-read", "user-read-email"]
	const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMITER)

	const [token, setToken] = useState("")
	const [searchKey, setSearchKey] = useState("")
	const [filter, setFilter] = useState("artist")

	const [artists, setArtists] = useState([])
	const [albums, setAlbums] = useState([])
	const [following, setFollowning] = useState([])
	const [top, setTop] = useState([])
	const [currentTrack, setCurrentTrack] = useState(null)
	const [playlists, setPlaylists] = useState([])
	const [tracks, setTracks] = useState([])
	const [topTracks, setTopTracks] = useState([])

	
	useEffect(() => {
		const hash = window.location.hash
		let access_token = window.localStorage.getItem("token")
		let expires_in = window.localStorage.getItem("TTL")
		let token_type = window.localStorage.getItem("Token_type")

		if (!access_token && hash) {
			const paramsInUrl=hash.substring(1).split("&")
			var paramsSplit = paramsInUrl.reduce((accu, curr) => {
				const [key, value] = curr.split("=")
				accu[key] = value
				console.log(accu)
				return accu
			}, {})
			// token = hash.substring(1).split("&").find(el => el.startsWith("access_token")).split("=")[1]
			// window.location.hash = ""
			// window.localStorage.setItem("token", token)
			console.log(paramsSplit);
			let {access_token, expires_in, token_type}= paramsSplit			
			window.localStorage.setItem("token", access_token)
			window.localStorage.setItem("TTL", expires_in)
			window.localStorage.setItem("Token_type", token_type)
			window.location.hash = ""
		}
		console.log(access_token)
		setToken(access_token)
	}, [])

	function logoutHandler() {
		window.localStorage.removeItem("token")
		setToken("")
	}



	//HTTP REQUEST

	
	async function searchData(e) {
		
		e.preventDefault()
		if (filter == 'artist') {
			const { data } = await axios.get("https://api.spotify.com/v1/search", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					q: searchKey,
					type: "artist",
					limit: 50
				}
			})
			console.log(data)
			setArtists(data.artists.items)
		}
		else if (filter == "album") {
			const { data } = await axios.get("https://api.spotify.com/v1/search", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					q: searchKey,
					type: "album",
					limit: 50
				}
			})
			console.log(data)
			setAlbums(data.albums.items)
		}

		else if(filter == "playlist"){
			const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", { 
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit : 50
				}				

			})
			console.log(data)
			setPlaylists(data.items)
		}
		else if(filter == "topArtists"){
			const { data } = await axios.get("https://api.spotify.com/v1/me/top/artists", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit : 50
				}				

			})
			console.log(data)
			setTop(data.items)
		}
		else if(filter == "topTracks"){
			const { data } = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit : 50
				}				

			})
			console.log(data)
			setTopTracks(data.items)
		}
		else if(filter == "following"){
			const { data } = await axios.get("https://api.spotify.com/v1/me/following", { 
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					type: "artist",
					limit: 50
				}				

			})
			console.log(data)
			setFollowning(data.artists.items)
		}
		else if(filter == "current"){
			const { data } = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", { 
				headers: {
					Authorization: `Bearer ${token}`
				}				

			})
			console.log(data)
			setCurrentTrack(data.item)
		}

		else if(filter == "library"){
			const { data } = await axios.get("	https://api.spotify.com/v1/me/tracks", { 
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit : 50
				}			

			})
			console.log(data)
			setTracks(data.items)
		}



	}
	function renderArtists(artists) {
		return artists.map(artist => (
			<div key={artist.id} className={styles.box}>
				{artist.images.length ? <img width={300} height={300} src={artist.images[0].url} alt="" /> : <div>No Image</div>}
				<h2>{artist.name}</h2>
			</div>
		))
	}
	function renderAlbums(albums) {
		return albums.map(album => (
			<div key={album.id} className={styles.box}>
				{album.images.length ? <img width={300} height={300} src={album.images[0].url} alt="" /> : <div>No Image</div>}
				<h2>{album.name}</h2>
			</div>
		))
	}

	function renderTrack(track) {
		
		return (
			<div className={styles.box}>
				{track?.album.images.length ? <img width={300} height={300} src={track?.album.images[0].url} alt="" /> : <div>No Image</div>} 
				<h1>{track?.name}</h1>
				<h4>{track?.album.name}</h4>
			</div>
		)
	}
	function renderTrack1({ track }) {		
		return (
			<div key={track.id} className={styles.box}>
				{track.album.images.length ? <img width={300} height={300} src={track.album.images[0].url} alt="" /> : <div>No Image</div>} 
				<h1>{track.name}</h1>
				<h4>{track.album.name}</h4>
			</div>
		)
	}
	function renderTracks(tracks) {
		return tracks.map(track => renderTrack1(track))
		
	}
	function renderTracks1(tracks) {
		return tracks.map(track => renderTrack(track))
		
	}

	

	return (
		<div className={styles.container}>
			<Head>
				<title>Spotify Data</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<nav className={styles.navbar}>
				<div className={styles.image}>					
					<Image  src ="/images/black.png"  width={"200%"} height={"60%"}/>	
									
				</div>
				<h1>Data Collection</h1>
				{!token ?
					<a className = {styles.link} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES_URL_PARAM}&response_type=${RESPONSE_TYPE}&show_dialog=true`}>Login</a>
					
					:
					<form className={styles.myform}>
						<input type="submit" value="Logout" onClick={logoutHandler} />
					</form>
				}
				
			</nav>
			<div className={styles.header}>
				{token ?
					<form onSubmit={searchData} className={styles.myform}>
						<label></label>
						<select name="Filter" id="Filter" required onChange={() => setFilter(document.getElementById('Filter').value)}>
							<option value="artist" >Artists</option>
							<option value="album">Albums</option>
							<option value="following">Following</option>
							<option value="library">Library</option>
							<option value="current">Current</option>
							<option value="topArtists">Top Artists</option>
							<option value="topTracks">Top Tracks</option>
							<option value="playlist">Playlists</option>
						</select>

						<br></br>
						<input type="text" placeholder="search..." onChange={e => setSearchKey(e.target.value)}></input>
						<input type={"submit"} id="but" value="Submit" />

					</form>
					: <h2></h2>
				}
			</div>
			<div className={styles.boxes}>
				{filter == 'artist' ? renderArtists(artists) 
					: filter == 'album' ? renderAlbums(albums) 
						:  filter == 'following' ? renderArtists(following) 
							: filter == 'topArtists' ? renderArtists(top)
								:filter == 'playlist' ? renderAlbums(playlists)
									: filter == 'current' ? renderTrack(currentTrack)
										: filter == 'library' ? renderTracks(tracks)
											: renderTracks1(topTracks)}
			</div>
			



		</div>
	)
}






