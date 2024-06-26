require('dotenv').config()

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const cors = require('cors')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds= 14;
const secretKey = process.env.JWT_SECRET;
const app = express();
const port = 3001;


app.use(express.json())
app.use(cors(
    {
        origin: 'http://localhost:5173', // Allow requests from this origin
    }
));

app.post('/register', async (req, res) => {
    const {username, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create user
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            return res.status(400).json({ message: 'Username not found' });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        // Create token
        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});


app.post('/logout', (req, res) => {

    res.status(200).json({ message: 'Logged out successfully' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
