'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var constants = require('../../lib/constants');
var crypto = require('crypto');
var AddressPortContact = require('../../lib/contacts/address-port-contact');
var hat = require('hat');

describe('AddressPortContact', function() {

  describe('@constructor', function() {

    it('should create an instance with the `new` keyword', function() {
      var c = new AddressPortContact({ address: '0.0.0.0', port: 1337 });
      expect(c).to.be.instanceOf(AddressPortContact);
    });

    it('should create an instance without the `new` keyword', function() {
      var c = AddressPortContact({ address: '0.0.0.0', port: 1337 });
      expect(c).to.be.instanceOf(AddressPortContact);
    });

    it('should throw without an address', function() {
      expect(function() {
        AddressPortContact({ port: 1337 });
      }).to.throw(Error, 'Invalid address was supplied');
    });

    it('should throw without a port', function() {
      expect(function() {
        AddressPortContact({ address: '0.0.0.0' });
      }).to.throw(Error, 'Invalid port was supplied');
    });

    it('should use the given nodeID instead of generating one', function() {
      var i = hat(constants.B);
      var c = AddressPortContact({ address: '0.0.0.0', port: 1337, nodeID: i });
      expect(c.nodeID).to.equal(i);
    });

    it('should throw with an invalid supplied nodeID', function() {
      expect(function() {
        var i = hat(24);
        var opts = { address: '0.0.0.0', port: 1337, nodeID: i };
        AddressPortContact(opts);
      }).to.throw(Error, 'Invalid nodeID was supplied');
    });

  });

  describe('#seen', function() {
    const sandbox = sinon.sandbox.create();
    afterEach(() => sandbox.restore());

    it('should update the lastSeen property', function() {
      var c = AddressPortContact({ address: '0.0.0.0', port: 1337 });
      var s1 = c.lastSeen;
      setTimeout(function() {
        c.seen();
        expect((c.lastSeen - s1 >= 10)).to.equal(true);
      }, 100);
    });

    it('should not update the lastSeen property on construction', function() {
      const clock = sandbox.useFakeTimers();
      clock.tick(100000);
      var d = AddressPortContact({ address: '127.0.0.1', port: 1337,
                                   lastSeen: 50000 });
      expect(d.lastSeen).to.equal(50000);
    });
  });

  describe('#valid', function() {

    it('should return false if port is 0', function() {
      var c = AddressPortContact({ address: '0.0.0.0', port: 0 });
      expect(c.valid()).to.equal(false);
    });

    it('should return false if port is greater than 65535', function() {
      var c = AddressPortContact({ address: '0.0.0.0', port: 65536 });
      expect(c.valid()).to.equal(false);
    });

    it('should return true if port is okay', function() {
      var c = AddressPortContact({ address: '0.0.0.0', port: 65535 });
      expect(c.valid()).to.equal(true);
    });

  });

  describe('#_createNodeID', function() {

    it('should compute the SHA1 digest of the address and port', function() {
      var c = AddressPortContact({ address: '0.0.0.0', port: 1337 });
      var i = crypto.createHash('sha1').update(c.address + ':' + c.port);
      expect(c._createNodeID()).to.equal(i.digest('hex'));
    });

  });

});
