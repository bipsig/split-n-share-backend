export const createGroup = async (req, res) => {
    console.log (`Creation of group being performed by user ${req.user.username}`);
    try {
        
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}