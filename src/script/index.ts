import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const ENDPOINT: string = "https://api.spotify.com/v1/search" as string;
const GRANT_TYPE = { grant_type: "client_credentials" };
const TOKEN: string = process.env.TOKEN;
const HEADERS = { headers: { Authorization: `Basic ${TOKEN}` } };
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const day:Date = new Date();
const presentYear:number = day.getFullYear();

interface AlbumProps {
	name: string,
	artists: ArtistProps[],
	album_type: string,
	href: string,
	id: string,
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
	genres: [],
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

type GetAlbums = (options: OptionProps) => Promise<AlbumProps[]>;

const getAlbums:GetAlbums = async (options) => {
	const result: AlbumProps[] = [];
	try {
		for (let offset = 0; offset < 2001; offset += 50) {
			options.params.offset = offset;
			const res: AxiosResponse<ResponseBody> = await Axios.get(ENDPOINT, options);
			const albumList: AlbumProps[] = res.data.albums.items;
			albumList.map((album) => {
				if (album.release_date_precision === 'day' && !album.release_date.includes('-01-01')) {
					result.push(album);
				}
				return;
			})
		}
	} catch (e) {
		if (Axios.isAxiosError(e) && e.response && e.response.status === 401) {
      		console.log('401 Bad or expired token');
      		console.log(e.message);
    	}
	}
	return result;
};

interface TokenInfo {
	access_token: string | null,
	token_type: string | null,
	expires_in: number | null
}

type GetAccessToken = () => Promise<string | null>;

const getAccessToken: GetAccessToken = async() => {
	let accessTokenInfo: TokenInfo = {
		access_token: null,
		token_type: null,
		expires_in: null,
	};
	try {
		const res:AxiosResponse<TokenInfo> = await Axios.post(TOKEN_URL, GRANT_TYPE, HEADERS)
		accessTokenInfo = res.data;
		return accessTokenInfo.access_token;
	} catch (e) {
		if (Axios.isAxiosError(e) && e.response && e.response.status === 400) {
      console.log('401 Bad or expired token');
      console.log(e.message);
		}
	}
	return accessTokenInfo.access_token
};

interface OptionProps extends AxiosRequestConfig {
	params: {
		q: string,
		type: string[],
		limit: number,
		offset: number,
	}
}

const main = async(year:number) => {
	const acccessToken = await getAccessToken();
	if (!acccessToken) {
		console.error('failed to get access token')
		return;
	}
	const options: OptionProps = {
		 headers: {
			Authorization: `Bearer ${acccessToken}}`,
		 },
		 params: {
			q: `*year:${presentYear - year}`,
			type: ['album'],
			limit: 50,
			offset: 0,
		 },
		}
	const albums = await getAlbums(options);
	albums.forEach((album) => console.log(album))
}
