import emailjs from "emailjs-com";
import swal from "sweetalert2";
import { UserModel } from '../../../server/models/userModel.js';
import { storeOperations } from '../../../server/data/mongodb/mongodb.js';

export const fieldText = {
  render: (data) => {
    const { label, placeholder, type, required, value } = data;
    return `
      <div class="form-field">
        <div class="field">

          <input 
            class="input text02" 
            value=${value || ''}
            id="input-${label}
            data-class="text02"
            size="13"
            autocomplete='on'
            name=${label}
            type=${type}
            placeholder=${placeholder}
            ${required ? 'required' : ''}
          >

          <!--
          <input
            class="input"
            value="fullerton, ca"
            size="13"
            id="detail-hours"
            data-class="text02"
          />
          -->
          
          <div class="controls">
            <!-- <div class="button edit-button" data-field="$ {label.toLowerCase().replace(' ', '-')}"> -->
            <div class="button edit-button" data-field="${label}">
              <div class="label">
                <div class="areas">Edit</div>
              </div>
              <img class="icon" src="icon0.svg" />
            </div>
          </div>
        </div>
        <div class="label2">
          <span class="text" data-class="text02">${label}</span>
        </div>
      </div>
    `;
  },
  after_render: async () => {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const field = e.target.closest('.edit-button').dataset.field;
        const input = document.getElementById(`input-${field}`);
        input.disabled = !input.disabled;
        if (!input.disabled) {
          input.focus();
        }
      });
    });

    const form = document.getElementById('user-profile-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const userData = Object.fromEntries(formData.entries());
      
      try {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(userData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('User updated successfully:', result);
          // Update UI or show success message
        } else {
          console.error('Failed to update user');
          // Show error message
        }
      } catch (error) {
        console.error('Error updating user:', error);
        // Show error message
      }
    });
  }
};

export const fieldDate = {
  render: (data) => {
    const { label, placeholder, type, required, value } = data;
    return `
      <input id="date" type="text" data-format="**-**-****" data-mask="MM-DD-YYYY"></input>
    `;
  }
};

// src/server/authServer.js
/*
app.post('/api/user/update', authenticateToken, async (req, res) => {
  try {
    const { username, aboutMe, location, website, fullName, email, phoneNumber } = req.body;
    
    // Validate username
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Invalid username format' });
    }

    // Validate aboutMe
    if (aboutMe && aboutMe.length > 600) {
      return res.status(400).json({ message: 'About me section exceeds 600 characters' });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: req.user.email },
      { 
        username, 
        description, 
        location, 
        website, 
        fullName, 
        email, 
        phoneNumber 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      `;
    },

  //   return `
  //     <div class="form-field">
  //       <div class="field">
  //         <input class="input" id="input-${type}" data-class="text02"
  //           autocomplete='on'
  //           name=${label}
  //           type=${type}
  //           placeholder=${placeholder}
  //           ${required ? 'required' : ''}
  //         />
          
  //         <!--
  //         <span class="input" id="detail-hours" data-class="text02">
  //           fullerton, ca
  //         </span>
  //         -->

  //         <div class="controls">
  //           <div class="button">
  //             <div class="label">
  //               <div class="areas">Edit</div>
  //             </div>
  //             <img class="icon" src="icon0.svg" />
  //           </div>
  //         </div>
  //       </div>
  //       <div class="label2">
  //         <span class="text" data-class="text02">Location</span>
  //       </div>
  //     </div>
  //   `;
  // },
  after_render: async () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      const data = {
        name: e.target.name.value,
        email: e.target.email.value,
        message: e.target.message.value,
      };

      try {
        const response = await emailjs.send(
          "Your Service Id",
          "Your Template Id",
          data,
          "Your User Id"
        );

        if (response.status === 200) {
          swal.fire("Great Job!", "Thanks for Contacting Us!", "success");
        }
      } catch (error) {
        console.log(error);
        if (error) {
          swal.fire(
            "Oops!",
            "Sorry, Something bad really happended, Please try again",
            "error"
          );
        }
      }
    };

    document
      .getElementById("contactform")
      .addEventListener("submit", handleSubmit);
  },
};
*/



const Form = {
  render: () => {
    return `
    <form
      class='form'
      id="contactform"
      disabled
    >
      <h4>Contact Us</h4>

      <input
        autocomplete='off'
        name='name'
        placeholder='Name*'
        required
      />

      <input
        autocomplete='off'
        name='email'
        type='email'
        placeholder='Email*'
        required
      />

      <textarea
        name='message'
        rows='8'
        placeholder='Message:'
        required
      ></textarea>
      <button type='submit' value='Send'>
        Send
      </button>
    </form>`;
  },
  after_render: async () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      const data = {
        name: e.target.name.value,
        email: e.target.email.value,
        message: e.target.message.value,
        description: e.target.description.value,
        location: e.target.location.value,
        website: e.target.website.value,
        fullName: e.target.fullName.value,
        phoneNumber: e.target.phoneNumber.value,
      };

      try {
        const response = await emailjs.send(
          "Your Service Id",
          "Your Template Id",
          data,
          "Your User Id"
        );

        if (response.status === 200) {
          swal.fire("Great Job!", "Thanks for Contacting Us!", "success");
        }
      } catch (error) {
        console.log(error);
        if (error) {
          swal.fire(
            "Oops!",
            "Sorry, Something bad really happended, Please try again",
            "error"
          );
        }
      }
    };

    document
      .getElementById("contactform")
      .addEventListener("submit", handleSubmit);
  },
};

export default Form;
