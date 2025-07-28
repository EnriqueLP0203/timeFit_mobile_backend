import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from  './connection/db.js'
import userRoutes from './routes/user.routes.js'
import gymRoutes from './routes/gym.routes.js'
import membershipRoutes from './routes/membership.routes.js'
import customerRoutes from './routes/customer.routes.js'
import reportRoutes from './routes/report.routes.js'


import cors from 'cors';
dotenv.config();

connectDB();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());


app.use('/api/user', userRoutes)
app.use('/api/gym', gymRoutes )
app.use('/api/membership', membershipRoutes )
app.use('/api/customer', customerRoutes)
app.use('/api/report', reportRoutes)

export default app;