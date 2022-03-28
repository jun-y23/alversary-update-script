import { model, Schema } from "mongoose";

interface Album {
	name: string,
	artists: Artist[],
	album_type: string,
	href: string,
	spotify_id: string,
	images: Image[],
	release_date: string,
	release_date_precision: string,
	uri: string
}

interface Artist {
	external_urls: {
	  spotify: string
	},
	href: string,
	id: string,
	name: string,
	type: string,
	uri: string
}

interface Image {
	url: string,
	height: number,
	width: number
}

const ImageSchema = new Schema<Image>({
	url: { type: String },
	height: { type: Number },
	width: { type: Number }
})

const ArtistSchema = new Schema<Artist>({
	external_urls: {
	  spotify: { type: String },
	},
	href: { type: String },
	id: { type: String },
	name: { type: String },
	type: { type: String },
	uri: { type: String }
})

const AlbumSchema = new Schema<Album>({
	name: { type: String, required: true },
	artists: [ArtistSchema],
	album_type: { type: String, required: true },
	href: { type: String, required: true },
	spotify_id: { type: String, required: true },
	images: [ImageSchema],
	release_date: { type: String, required: true },
	release_date_precision: { type: String },
	uri: { type: String }
})

export default model("Album", AlbumSchema)