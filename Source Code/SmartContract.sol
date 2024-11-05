// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RealEstateMarket {
    struct Property {
        address payable owner;
        string description;
        uint price;
        bool isListed;
    }

    struct Offer {
        address payable buyer;
        uint amount;
        bool isAccepted;
    }

    Property[] public properties;
    mapping(uint => Offer[]) public offers;

    function addProperty(string memory _description, uint _price) public {
        properties.push(Property(payable(msg.sender), _description, _price, true));
    }

    function makeOffer(uint _propertyId, uint _offerAmount) public payable {
        require(properties[_propertyId].isListed, "Property is not available for sale.");
        require(msg.value == _offerAmount, "The offer amount must match the sent value.");
        offers[_propertyId].push(Offer(payable(msg.sender), _offerAmount, false));
    }

    function acceptOffer(uint _propertyId, uint _offerId) public {
        Offer storage offer = offers[_propertyId][_offerId];
        Property storage property = properties[_propertyId];

        require(msg.sender == property.owner, "Only the property owner can accept offers.");
        require(!offer.isAccepted, "Offer is already accepted.");
        
        property.owner.transfer(offer.amount);
        offer.isAccepted = true;
        property.isListed = false;
        property.owner = offer.buyer;
    }

    function rejectOffer(uint _propertyId, uint _offerId) public {
        Offer storage offer = offers[_propertyId][_offerId];
        Property storage property = properties[_propertyId];

        require(msg.sender == property.owner, "Only the property owner can reject offers.");
        require(!offer.isAccepted, "Offer is already accepted.");

        offer.buyer.transfer(offer.amount);
    }

    function getPropertiesCount() public view returns (uint) {
        return properties.length;
    }

    function getOffers(uint _propertyId) public view returns (Offer[] memory) {
        return offers[_propertyId];
    }

    function getOffersCount(uint _propertyId) public view returns (uint) {
        return offers[_propertyId].length;
    }

}