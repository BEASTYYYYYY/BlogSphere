export const loginWithToken = async (req, res) => {
    try {
        const user = req.user;
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};
