import emailjs from "emailjs-com";
import swal from "sweetalert2";


export const formField = {
  render: (data) => {
    const { label, placeholder, type, required } = data;
    return `
      <div class="form-field">
        <div class="field">
          <input
            class="input"
            value="fullerton, ca"
            size="13"
            id="detail-hours"
            data-class="text02"
          />
          <div class="controls">
            <div class="button">
              <div class="label">
                <div class="areas">Edit</div>
              </div>
              <img class="icon" src="icon0.svg" />
            </div>
          </div>
        </div>
        <div class="label2">
          <span class="text" data-class="text02">Location</span>
        </div>
      </div>
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
