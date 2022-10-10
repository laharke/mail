document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('form').onsubmit = send_email;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //Load the mailbox with INBOX, tecnicamente yo tendria uqe cmbiar el /inbox por /<str>:mailbox asi me lo llena con inbox arvhiced o sent.
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
      emails.forEach(email => show_email(email, mailbox));
});
}



function send_email() {
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
        localStorage.clear();
        load_mailbox('sent');
    });

    
    return false;
}


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

   // Le pongo el color al backgroudn segun si esta read o unread
   if (email.read == true) {
    emailDiv.style.backgroundColor = "Silver";
  }
  if (email.read == false) {
    emailDiv.style.backgroundColor = "white";
  }

  // Agrego el Archive o Unarchive button solo si no es SEND
  if (mailbox == 'inbox' || mailbox == 'archive'){
    const archiveDiv = document.createElement('div');
    const archiveImg = document.createElement('img');
    archiveDiv.className = 'col-1';
    archiveImg.src = "../../static/archive.svg";
    archiveDiv.append(archiveImg);
    emailDiv.append(archiveDiv);
    archiveImg.addEventListener('click', () => archive_email(email.id, mailbox));
  };



  const emailsView = document.querySelector('#emails-view');
  emailsView.append(emailDiv);

  //Deberia agregar un even listener a cada elemento que cree que si hacen click llamo ala funcion displayemail
  senderDiv.addEventListener('click', () => display_email(email.id));
  subjectDiv.addEventListener('click', () => display_email(email.id));
  fechaDiv.addEventListener('click', () => display_email(email.id));
  // SETTEAR TODO PARA QUE SE PUEDA RESPONDER UN EMAIL
  
  const esteBotton = document.querySelector('#button');
  console.log(esteBotton);
};

function display_email(id) {
  //Setting the other views to none and the new one to block
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'block';

  //fetching the requested email and populating all the campos
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    
    document.querySelector('#from').innerHTML = email.sender;
    document.querySelector('#to').innerHTML = email.recipients;
    document.querySelector('#subject').innerHTML = email.subject;
    document.querySelector('#date').innerHTML = email.timestamp;
    document.querySelector('#textarea').innerHTML = email.body;

    document.querySelector('#button').addEventListener('click', () => reply_email(email));
    //mark as read if its not alredy
    if (email.read == false){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
    console.log(email)
  });
  
}

function archive_email(id, mailbox){
  // si llego del mailbox INBOX, tengo que ARCHIVAR, si llego del mailbox ARCHIVED, tengo que desarchviar
  if (mailbox == 'inbox'){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    });

  }
  //caso que venga de archived
  if (mailbox == 'archive'){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    });
  }
  load_mailbox('inbox');
  window.location.reload();
}

function reply_email(email) {
  console.log('estamos aca perro');
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';
  document.querySelector('#compose-recipients').value = email.sender;
  
  let sub = email.subject.slice(0,3);
  if (sub == 'Re:') {
    document.querySelector('#compose-subject').value = `${email.subject}`;
  }
  else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  

  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} Wrote: \n ${email.body}`;

};