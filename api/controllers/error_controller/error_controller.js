exports.error4o4Controller = (req, res, next) => {
    let err = new Error("404 no route");
    err.status = 404
    next(err)
}

exports.error401Controller = (error, req, res, next) => {
    if(error.status) {
        res.status(401).json({
            status: false,
            message: error?.message || "User is unauthorized!!!"
        });
    }
    return res.json({
        status: false,
        message: "User is unauthorized!!!"
    });
}


exports.error500Controller = (error, req, res, next) => {

    if (error.status) {
        console.log(error?.message);
        return res.status(error.status).json({
            status: false,
            message: error?.message ?? 'server error'
        });
    }

    // console.log(error?.message);
    return res.json({message: "server error"})
}