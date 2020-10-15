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