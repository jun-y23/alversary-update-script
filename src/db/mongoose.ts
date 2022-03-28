import Mongoose from 'mongoose';
import 'dotenv/config'

// const uri = 'mongodb://localhost:27017'
const uri = process.env.DB_URI as string;

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    dbName: "alversary"
}

const connect = async () => {
try {
	await Mongoose.connect(uri, options);
	console.log('success')
} catch (error) {
	console.error(error);
}
};

connect().catch(() => console.error('close'));
