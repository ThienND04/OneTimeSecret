const { regesterSchema, loginSchema } = require('../schemas/authSchemas');
const User = require('../models/User');

class AuthController {
    async login(req, res) {

    }

    async register(req, res) {
        const parsedBody = regesterSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.errors });
        }
        console.log(parsedBody.data);

        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already in use' });
        }

        const newUser = new User(parsedBody.data);
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });

    }

    async logout(req, res) {

    }

    async getProfile(req, res) {

    }
}

module.exports = new AuthController();