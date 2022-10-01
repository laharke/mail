document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log('asfdas')
  //Load the mailbox with INBOX, tecnicamente yo tendria uqe cmbiar el /inbox por /<str>:mailbox asi me lo llena con inbox arvhiced o sent.
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      console.log('asfdas')
      emails.forEach(email => { 
        show_email(email, mailbox);
      });
      // ... do something else with emails ...
});
}



document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#compose-form').onsubmit = () => {
    // aca lelgo si ponene submit
    //agarro los values del form para enviarlos a la API
    let recipientsValue = document.querySelector('#compose-recipients').value;
    let subjectValue = document.querySelector('#compose-subject').value;
    let bodyValue = document.querySelector('#compose-body').value;

    console.log(recipientsValue, subjectValue, bodyValue);

    // post request to call the api and send the email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipientsValue,
          subject: subjectValue,
          body: bodyValue
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  }
});

function show_email(email, mailbox) {

  // Create the div que abarca los bordes y toda la info, la row, despues creo las tres col para mostrar: quien envio el email, Subject y timestamp (despues agregar para archivar)
  const emailDiv = document.createElement('div');
  emailDiv.className = 'email row'

  // Creo el primer Div para mostrar quien envio el email y le asigno la col
  const senderDiv = document.createElement('div');
  senderDiv.className = 'col';
  senderDiv.innerHTML = email.sender;
  emailDiv.append(senderDiv);

   // Creo el segundo Div para mostrar el subject del email y le asigno la col
   const subjectDiv = document.createElement('div');
   subjectDiv.className = 'col';
   subjectDiv.innerHTML = email.subject;
   emailDiv.append(subjectDiv);

   // Creo el tercer Div para mostrar fecha y hora del email y le asigno la col
   const fechaDiv = document.createElement('div');
   fechaDiv.className = 'col';
   fechaDiv.innerHTML = email.timestamp;
   emailDiv.append(fechaDiv);

  
  const emailsView = document.querySelector('#emails-view');
  emailsView.append(emailDiv);


};