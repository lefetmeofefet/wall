

async function loadFile(type, onFileLoaded) {
    let finish
    let fail
    let promise = new Promise((resolve, reject) => {finish = resolve; fail = reject})
    const inputElement = document.createElement('input')
    inputElement.style.display = 'none'
    inputElement.type = 'file'
    inputElement.accept = type || "*"

    inputElement.addEventListener('change', () => {
        if (inputElement.files) {
            const reader = new FileReader()
            reader.onloadend = async () => {
                onFileLoaded && onFileLoaded(reader.result)
                finish(reader.result)
            }
            reader.readAsDataURL(inputElement.files[0]) // Converts file to Base64
        }
    })

    const teardown = () => {
        fail()
        document.body.removeEventListener('focus', teardown, true)
        setTimeout(() => {
            document.body.removeChild(inputElement)
        }, 1000)
    }
    document.body.addEventListener('focus', teardown, true)

    document.body.appendChild(inputElement)
    inputElement.click()
    return promise
}

export {loadFile}