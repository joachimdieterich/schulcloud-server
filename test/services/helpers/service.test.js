'use strict';

const expect = require('chai').expect;
const mockery = require('mockery');
const winston = require('winston');
const nodemailerMock = require('nodemailer-mock');

describe('Mail Service', () => {

	const emailOptions = {
		email: "test@test.test",
		subject: "test",
		content: {"html": "<h1>Testing Purposes</h1>", "text": "Testing Purposes"}
	};

	var mailService;

	before(function (done) {

		// Enable mockery to mock objects
		mockery.enable({
			warnOnUnregistered: false
		});

		// Once mocked, any code that calls require('nodemailer') will get our nodemailerMock
		mockery.registerMock('nodemailer', nodemailerMock);

		// Make sure anything that uses nodemailer is loaded here, after it is mocked...
		delete require.cache[require.resolve('../../../src/services/helpers/service')];

		// load new app to make mockery work
		const feathers = require('feathers');
		const app = feathers();
		let secrets;
		try {
			secrets = require('../config/secrets.json');
		} catch(error) {
			secrets = {};
		}
		app.set("secrets", secrets);
		const MailService = require('../../../src/services/helpers/service')(app);
		app.use('/mails', new MailService());
		mailService = app.service('/mails');

		done();
	});

	after(function () {

		// Remove our mocked nodemailer and disable mockery
		mockery.deregisterAll();
		mockery.disable();

	});

	it('should send an email using nodemailer-mock', function () {

		// call a service that uses nodemailer
		return mailService.create(emailOptions)
			.then((response) => {
				winston.info(response);
				expect(response.accepted).to.have.lengthOf(1);
				expect(response.accepted[0]).to.be.equal("accepted");
				expect(response.response).to.contain("success");

				return;
			});
	});

	it('should fail to send an email using nodemailer-mock', function () {

		// tell the mock class to return an error
		const err = 'My custom error';
		nodemailerMock.mock.shouldFailOnce();
		nodemailerMock.mock.failResponse(err);

		// call a service that uses nodemailer
		return mailService.create(emailOptions)
			.catch((err) => {
				expect(err).to.be.equal(err);

				return;
			});
	});
});
