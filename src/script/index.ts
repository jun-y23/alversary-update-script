import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Album from '../models/album'
import 'dotenv/config'
import '../db/mongoose';

const endpoint: string = "https://api.spotify.com/v1/search" as string;
const clientId: string = process.env.CLIENT_ID as string;
const clientSecret: string = process.env.CLIENT_SECRET as string;
const clientToken = Buffer.from(clientId+':'+clientSecret).toString('base64');
const authUrl = 'https://accounts.spotify.com/api/token'
const authParams = new URLSearchParams()
authParams.append('grant_type', 'client_credentials');

const authOptions = {
	headers: {
	  'Authorization': 'Basic ' + `${clientToken}`,
	  'Content-Type': 'application/x-www-form-urlencoded' 
}};

const day:Date = new Date();
const presentYear:number = day.getFullYear();

interface AuthConfig extends AxiosRequestConfig {
	headers: {
		'Authorization': string,
		'Content-Type': 'application/x-www-form-urlencoded',
	}
}

interface AlbumProps {
	name: string,
	artists: ArtistProps[],
	album_type: string,
	href: string,
	id?: string,
	spotify_id?: string,
	images: ImageProps[],
	release_date: string,
	release_date_precision: string,
	uri: string
}

interface ArtistProps {
	external_urls: {
	  spotify: string
	},
	followers: {
	  href: string,
	  total: number
	},
	genres: string[],
	href: string,
	id: string,
	images: ImageProps[],
	name: string,
	popularity: number,
	type: string,
	uri: string
}

interface ImageProps {
	url: string,
	height: number,
	width: number
}

interface ResponseBody {
	tracks: SearchResponseProps,
	artists: SearchResponseProps,
	albums: SearchResponseProps,
	playlists: SearchResponseProps,
	shows: SearchResponseProps,
	episodes: SearchResponseProps
}

interface SearchResponseProps {
	href: string,
	items: [],
	limit: number,
	next: string,
	offset: number,
	previous: string,
	total: number
}
interface TokenInfo {
	access_token: string | null,
	token_type: string | null,
	expires_in: number | null
}

interface OptionProps extends AxiosRequestConfig {
	params: {
		q: string,
		type: string,
		limit: number,
		offset: number,
	}
}

type GetAlbums = (options: OptionProps) => Promise<AlbumProps[]>;
type GetAccessToken = () => Promise<string | null>;

const getAlbums:GetAlbums = async (options) => {
	const result: AlbumProps[] = [];
	try {
		for (let offset = 0; offset < 2001; offset += 50) {
			options.params.offset = offset;
			const res: AxiosResponse<ResponseBody> = await Axios.get(endpoint, options);
			const albumList: AlbumProps[] = res.data.albums.items;
			albumList.map((album) => {
				console.log(album.artists);
				if (album.release_date_precision === 'day' && !album.release_date.includes('-01-01')) {
					result.push(foramtAlbumData(album));
				}
			});
		}
	} catch (e) {
		if (Axios.isAxiosError(e) && e.response && e.response.status === 401) {
      		console.log('401 Bad or expired token');
      		console.log(e.message);
    	} else {
			console.log('faield')
		}
	}
	return result;
};

const getAccessToken: GetAccessToken = async() => {
	let accessTokenInfo: TokenInfo = {
		access_token: null,
		token_type: null,
		expires_in: null,
	};
	try {
		const res:AxiosResponse<TokenInfo, AuthConfig> = await Axios.post(authUrl, authParams, authOptions)
		accessTokenInfo = res.data;
	} catch (e) {
		if (Axios.isAxiosError(e) && e.response && e.response.status === 401) {
      		console.log('401 Bad or expired token');
      		console.log(e.message);
		}
		console.log(e)
	}
	return accessTokenInfo.access_token
};

const main = async(year:number) => {
	const acccessToken = await getAccessToken();
	if (!acccessToken) {
		console.error('failed to get access token')
		return;
	}
	const options: OptionProps = {
		 headers: {
			Authorization: `Bearer ${acccessToken}`,
			'Content-Type': 'application/json'
		 },
		 params: {
			q: `*year:${presentYear - year}`,
			type: "album",
			limit: 50,
			offset: 0,
		 }
	};
	const albums = await getAlbums(options);
	albums.map( async (album) => {
		const albumInfo = new Album(album);
        try {
          await albumInfo.save();
        } catch (err) {
          console.log(err);
        }
	});
};

const foramtAlbumData = (album: AlbumProps) => {
	album.spotify_id = album.id;
	delete album.id;
	return album
}

main(1).catch((e) => console.log(e));