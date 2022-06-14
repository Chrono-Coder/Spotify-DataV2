import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect} from 'react'
import axios from 'axios'
import * as d3 from 'd3'
import * as d3_scale from 'd3-scale'

export default function Home() {//{ topTracksData, topArtistsData, followingData, playlistsData, libraryData, currentTrackData }
	const CLIENT_ID = "98f0b93b224645efb38fe8dcfbdf712d"
    const REDIRECT_URI = "https://spotify-data-v2.vercel.app/"
    // const REDIRECT_URI = "http://176.205.103.177:3000/"//help/login/"/*http://localhost:3000/"*/
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token";
    const SPACE_DELIMITER = "%20"
    const SCOPES = ["user-library-read", "user-read-currently-playing", "user-top-read", "user-follow-read", "user-read-email", "user-read-recently-played"]
    const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMITER)


	// const [event, setEvent] = useState("")
	const [token, setToken] = useState("")
	const [isGrid, setIsGrid] = useState("true")
	// const [isGraphed, setIsGraphed] = useState("false")
	const [searchKey, setSearchKey] = useState("")
	const [filter, setFilter] = useState("none")

	
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
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(el => el.startsWith("access_token")).split("=")[1]
            window.location.hash = ""
            window.localStorage.setItem("token", token)

        }
        setToken(token)

		
    }, [])

	useEffect(() => {
		// console.log(event)
		getData(event)

    }, [filter])
	
	useEffect(() => {
    if(!isGrid){
		renderGraph(artists)
	}		
    }, [isGrid])

	function toggleGrid() {
		isGrid && (filter=="artist" || filter=="topArtists" || filter=="following") ? setIsGrid(false) : setIsGrid(true)
	}

	function logoutHandler() {
		window.localStorage.removeItem("token")
		setToken("")
		window.location = REDIRECT_URI;
	}

	async function getData(e) {
		//console.log("HEY")
		// setEvent(e)
		e ? e.preventDefault() : e
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

		else if (filter == "playlist") {
			const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit: 50
				}

			})
			console.log(data)
			setPlaylists(data.items)
		}
		else if (filter == "topArtists") {
			const { data } = await axios.get("https://api.spotify.com/v1/me/top/artists", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit: 50,
					time_range: "short_term"
				}

			})
			console.log(data)
			setTop(data.items)
		}
		else if (filter == "topTracks") {
			const { data } = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit: 50
				}

			})
			console.log(data)
			setTopTracks(data.items)
		}
		else if (filter == "following") {
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
		else if (filter == "current") {
			const { data } = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
				headers: {
					Authorization: `Bearer ${token}`
				}

			})
			// const { data2 } = await axios.get("https://api.spotify.com/v1/me/player/recently-played", { 
			// 	headers: {
			// 		Authorization: `Bearer ${token}`
			// 	},
			// 	params: {
			// 		limit:1,
			// 		after:1000
			// 	}			

			// })
			console.log(data)
			//data ? 
			setCurrentTrack(data.item)// : setCurrentTrack(data2?.items[0])


		}

		else if (filter == "library") {
			const { data } = await axios.get("	https://api.spotify.com/v1/me/tracks", {
				headers: {
					Authorization: `Bearer ${token}`
				},
				params: {
					limit: 50
				}

			})
			console.log(data)
			setTracks(data.items)
		}



	}

	function renderGraph(artists){
		
		var dict= {"rock":0, "pop":0, "metal":0, "rap":0, "other":0, "folk":0, "rnb":0, "alternative":0}
		artists.map(a => {
			var genres = a.genres	
			if(genres.length == 0){				
				dict["other"] += 1				
			}
			else
				for(let i = 0; i <genres.length; i++){
					var gen = genres[i].toString()
					// console.log(gen)
						if(gen){
							if(gen.indexOf("rock") >-1){							
								dict["rock"] += 1
								break
							}
							else if(gen.indexOf("pop") >-1){
								dict["pop"] += 1
								break
							}
								
							else if(gen.indexOf("metal") >-1){
								dict["metal"] += 1
								break
							}

							else if(gen.indexOf("rap") >-1 || gen.indexOf("hip hop") >-1){
								dict["rap"] += 1
								break
							}						

							else if(gen.indexOf("folk") >-1){
								dict["folk"] += 1	
								break
							}							

							else if(gen.indexOf("rnb") >-1){
								dict["rnb"] += 1
								break
							}

							else if(gen.indexOf("alternative") >-1){
								dict["alternative"] += 1
								break
							}
							if(i== genres.length - 1){
								dict["other"] += 1
								break	
							}					
						}
						else
							dict["other"] += 1
							break
						}
					
		})

		var data = []
		for(var key in dict) {
			//let obj = {}
			// obj[count.toString()] = {genre:key, count:dict[key]}
			if(dict[key]!= 0)
				data.push( {genre:key, count:dict[key]})	
		}
		console.log(data)
		
		const WIDTH=600
		const HEIGHT=400

		const x = d3.scaleBand().rangeRound([0,WIDTH]).padding(0.1)
		const y = d3.scaleLinear().range([HEIGHT,0])

		x.domain(data.map(d => d.genre))
		y.domain([0, d3.max(data, (d) => d.count) + 10])
		
		const chartContainer = d3
		.select('svg')
		// .classed("svg-container", true) 
		.attr('width',WIDTH)
		.attr('height',HEIGHT)
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 600 400")
		chartContainer.selectAll("*").remove()
		

		chartContainer
		.append("g")
		.call(d3.axisBottom(x))
		.attr("color", "#FE6D73")

		chartContainer
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.classed('bar',false)
		.attr('width', x.bandwidth())
		.attr('height', d => HEIGHT - y(d.count))
		.attr('x', d => x(d.genre))
		.attr('y', d => y(d.count))
	
		chartContainer
		.selectAll(".label")
		.data(data)
		.enter()
		.append("text")
		.text(d => d.count)
		.attr('x', d  => x(d.genre) + x.bandwidth()/2)
		.attr('y', d => y(d.count) -20)
		.attr('text-anchor', 'middle')
		
		
		// chartContainer
		// .selectAll(".label")
		// .data(data)
		// .enter()
		// .append("text")
		// .text(d => d.genre)
		// .attr('x', d  => x(d.genre) + x.bandwidth()/2)
		// .attr('y', 15 )
		// .attr('text-anchor', 'middle')

	}
	function renderArtists(artists) {
		if (isGrid)
			return artists.map(artist => (
				<div key={artist.id} className={styles.boxA}>
					{artist.images.length ? <a href={artist.uri}><img width={300} height={300} src={artist.images[0].url} alt=""></img></a> : <div>No Image</div>}
					<p className={styles.link}><a href={artist.uri}>{artist.name} </a></p>
				</div>
			))
		return (
			<div>	
				{renderGraph(artists)}
				{/* <h1>Graph</h1> */}
				<div className={styles.svg_container}>					
					<svg className={styles.svg_content_responsive}></svg>
				</div>
			</div>
		)

	}
	function renderAlbums(albums) {
		return albums.map(album => (
			<div key={album.id} className={styles.box}>
				{album.images.length ? <a href={album.uri}><img width={300} height={300} src={album.images[0].url} alt="" /></a> : <div>No Image</div>}
				<p className={styles.link}><a href={album.uri}>{album.name} </a></p>
			</div>
		))
	}
	function renderTrack(track) {

		return (
			<div key={track?.id} className={styles.box}>
				{track?.album.images.length ? <a href={track?.uri}><img width={300} height={300} src={track?.album.images[0].url} alt="" /></a> : <div>No Image</div>}
				<p className={styles.link}><a href={track?.uri}>{track?.name}</a></p>
				{/* <p><a href={track?.album.uri}>{track?.album.name}</a></p> */}
			</div>
		)
	}
	function renderTrack1({ track }) {
		return (
			<div key={track.id} className={styles.box}>
				{track.album.images.length ? <a href={track?.uri}><img width={300} height={300} src={track?.album.images[0].url} alt="" /></a> : <div>No Image</div>}
				<p className={styles.link}><a href={track?.uri}>{track?.name}</a></p>
				{/* <h4><a href={track?.album.uri}>{track?.album.name}</a></h4> */}
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
					<Image priority src="/images/black.png" width={"200%"} height={"60%"} />

				</div>
				<h1>Data Collection</h1>

				{!token ?
					<a className={styles.link} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES_URL_PARAM}&response_type=${RESPONSE_TYPE}&show_dialog=true`}>Login</a>

					: 
					<form className={styles.myform}>
						<input type="submit" value="Logout" onClick={logoutHandler} />
						{/* <Link href="./login"></Link> */}
					</form>
				}

			</nav>
			<>
				{token ?
					<header className={styles.header}>
						<form  className={styles.myform}>
							<label></label>
							<select name="Filter" id="Filter" defaultValue="none" required onChange={() => {
								setFilter(document.getElementById('Filter').value)
								// console.log(filter)
								// getData
								}}  >
									{/* onChange={setEvent} */}

								{/* {document.getElementById('Filter')?.value ? console.log("Selected:" + document.getElementById('Filter').value) : console.log("Selected:" + "Blank")} */}
								<option value="none" disabled hidden>Select an Option</option>
								<option value="artist">Artists</option>
								<option value="album">Albums</option>
								<option value="following">Following</option>
								<option value="library" >Library </option>
								<option value="current">Current</option>
								<option value="topArtists">Top Artists</option>
								<option value="topTracks">Top Tracks</option>
								<option value="playlist">Playlists</option>
								{/* {console.log(filter)} */}
							</select>

							<br></br>
							<input type="text" placeholder="search..." onChange={e => { setSearchKey(e.target.value); }}></input>
							<input type="submit" id="but" value="Submit" onClick={getData}/>

						</form>
						{isGrid ? <div className={styles.image}><Image priority src="/images/chart.png" width={"30%"} height={"30%"} onClick={toggleGrid} /></div>
							:
							<div className={styles.image}><Image priority src="/images/grid2.png" width={"25%"} height={"25%"} onClick={toggleGrid} /></div>
						}

					</header>

				: <h2></h2> }
				{/* } */}
			</>
			<div className={styles.boxes}>
				{filter == 'artist' ? renderArtists(artists)
					: filter == 'album' ? renderAlbums(albums)
						: filter == 'following' ? renderArtists(following)
							: filter == 'topArtists' ? renderArtists(top)
								: filter == 'playlist' ? renderAlbums(playlists)
									: filter == 'current' ? renderTrack(currentTrack)
										: filter == 'library' ? renderTracks(tracks)
											: renderTracks1(topTracks)}
			</div>




		</div>
	)
}




// export async function getStaticProps() {
// 	const musicData = await getAPIData()
// 	// window.location = "http://176.205.103.177:3000/"
// 	return {
// 		props: {
// 			musicData
// 		}
// 	  }
	
// }







