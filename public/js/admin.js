document.getElementById("deleteBtn").addEventListener("submit", deleteProduct)


function deleteProduct(req, res, next){
    event.preventDefault()
    console.log(req)
    const prodId = req.target[1].value
    const csrf = req.target[2].value

    console.log('function entered')
    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token' : csrf
        }
    }).then(result => {
        location.reload()
    }).catch(err => {
        console.log(err)
    })
}

//On submit, it already gets pushed to a route. in postAdd and postEdit controller, handle as if it was just requested in a route.
//use async await to upload the image to the database, then use the response url to serve image
//let program read image from folder, but if image source from location is not found, load from cloudinary