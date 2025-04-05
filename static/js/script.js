document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        alert('Login successful!');
        window.location.href = 'index.html'; // Redirect to the main page
    } else {
        alert('Login failed. Please check your credentials.');
    }
});

document.getElementById('signUpForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        alert('Registration successful! You can now log in.');
        window.location.href = 'login.html'; // Redirect to the login page
    } else {
        alert('Registration failed. Username may already exist.');
    }
});
// Reveal the main box when in viewport
document.addEventListener("DOMContentLoaded", () => {
    const box = document.querySelector(".box");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                box.classList.add("visible");
            }
        });
    });

    observer.observe(box);
});

async function submitQuiz() {
    const userId = document.getElementById('user_id').value; // Get user ID
    const responses = [];

    // Collect responses from the form
    for (let i = 1; i <= 10; i++) {
        const selectedOption = document.querySelector(`input[name="q${i}"]:checked`);
        if (selectedOption) {
            responses.push({
                question_id: i,
                selected_option: selectedOption.value
            });
        }
    }

    // Check if any responses were selected
    if (responses.length === 0) {
        document.getElementById('result').innerText = 'Please select at least one response.';
        return; // Exit the function if no responses are selected
    }

    // Send the responses to the Flask backend
    const response = await fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, responses: responses }),
    });

    if (response.ok) {
        const result = await response.json();
        document.getElementById('result').innerText = result.message; // Display success message
    } else {
        const errorData = await response.json();
        document.getElementById('result').innerText = 'Failed to submit responses: ' + (errorData.error || 'Unknown error');
    }
}

//     // Send the responses to the Flask backend
//     const response = await fetch('/submit', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ user_id: userId, responses: responses }),
//     });

//     if (response.ok) {
//         const result = await response.json();
//         document.getElementById('result').innerText = result.message; // Display success message
//     } else {
//         document.getElementById('result').innerText = 'Failed to submit responses.';
//     }
// }

// Hover glow effect
const box = document.querySelector('.box');
box.addEventListener('mouseenter', () => {
    box.classList.add('hover-glow');
});

box.addEventListener('mouseleave', () => {
    box.classList.remove('hover-glow');
});

// Optional: Smooth scroll for any internal anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});
