// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IChainCreditsToken {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract CarbonCreditsTrading {
    uint256 public nextOrderId;
    uint256 public nextTradeId;
    IChainCreditsToken public chainCreditsToken;

    constructor(address _chainCreditsTokenAddress) {
        chainCreditsToken = IChainCreditsToken(_chainCreditsTokenAddress);
    }

    struct Order {
        uint256 id;
        address institute;
        uint256 quantity;
        uint256 pricePerCredit;
        bool isBuyOrder;
        bool isFulfilled;
    }

    struct Trade {
        uint256 id;
        uint256 buyOrderId;
        uint256 sellOrderId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 pricePerCredit;
    }

    Order[] public orders;
    Trade[] public trades;

    event OrderPlaced(uint256 id, address institute, uint256 quantity, uint256 pricePerCredit, bool isBuyOrder);
    event OrderMatched(uint256 id, uint256 buyOrderId, uint256 sellOrderId, address buyer, address seller, uint256 quantity, uint256 pricePerCredit);

    function placeOrder(uint256 quantity, uint256 pricePerCredit, bool isBuyOrder) public {
        if (isBuyOrder) {
            require(chainCreditsToken.transferFrom(msg.sender, address(this), quantity * pricePerCredit), "Transfer of CCT failed");
        }
        Order memory newOrder = Order(nextOrderId, msg.sender, quantity, pricePerCredit, isBuyOrder, false);
        orders.push(newOrder);
        emit OrderPlaced(nextOrderId, msg.sender, quantity, pricePerCredit, isBuyOrder);

        if (isBuyOrder) {
            matchBuyOrder(newOrder);
        } else {
            matchSellOrder(newOrder);
        }

        nextOrderId++;
    }

    function matchBuyOrder(Order memory buyOrder) private {
        for (uint i = 0; i < orders.length; i++) {
            Order storage sellOrder = orders[i];
            if (!sellOrder.isBuyOrder && !sellOrder.isFulfilled && sellOrder.quantity == buyOrder.quantity && sellOrder.pricePerCredit <= buyOrder.pricePerCredit) {
                trades.push(Trade(nextTradeId, buyOrder.id, sellOrder.id, buyOrder.institute, sellOrder.institute, buyOrder.quantity, sellOrder.pricePerCredit));
                emit OrderMatched(nextTradeId, buyOrder.id, sellOrder.id, buyOrder.institute, sellOrder.institute, buyOrder.quantity, sellOrder.pricePerCredit);
                sellOrder.isFulfilled = true;
                buyOrder.isFulfilled = true;
                chainCreditsToken.transfer(sellOrder.institute, sellOrder.quantity * sellOrder.pricePerCredit);
                removeOrder(buyOrder.id);
                removeOrder(sellOrder.id);
                nextTradeId++;
                break;
            }
        }
    }

    function matchSellOrder(Order memory sellOrder) private {
        for (uint i = 0; i < orders.length; i++) {
            Order storage buyOrder = orders[i];
            if (buyOrder.isBuyOrder && !buyOrder.isFulfilled && buyOrder.quantity == sellOrder.quantity && buyOrder.pricePerCredit >= sellOrder.pricePerCredit) {
                trades.push(Trade(nextTradeId, buyOrder.id, sellOrder.id, buyOrder.institute, sellOrder.institute, sellOrder.quantity, buyOrder.pricePerCredit));
                emit OrderMatched(nextTradeId, buyOrder.id, sellOrder.id, buyOrder.institute, sellOrder.institute, sellOrder.quantity, buyOrder.pricePerCredit);
                buyOrder.isFulfilled = true;
                sellOrder.isFulfilled = true;
                chainCreditsToken.transfer(sellOrder.institute, sellOrder.quantity * buyOrder.pricePerCredit);
                removeOrder(buyOrder.id);
                removeOrder(sellOrder.id);
                nextTradeId++;
                break;
            }
        }
    }

function cancelOrder(uint256 orderId) public {
    require(orderId < nextOrderId, "Invalid order ID");

    Order storage order = orders[orderId];
    require(order.institute == msg.sender, "You can only cancel your own orders");
    require(!order.isFulfilled, "Order is already fulfilled");

    order.isFulfilled = true; // Mark the order as fulfilled to effectively cancel it

    if (order.isBuyOrder) {
        // Refund the locked CCT tokens to the user
        require(chainCreditsToken.transfer(msg.sender, order.quantity * order.pricePerCredit), "Refund failed");
    }

    emit OrderCancelled(orderId, msg.sender); // Emit an event to notify about the cancellation
}

event OrderCancelled(uint256 indexed id, address indexed institute);




    function removeOrder(uint256 orderId) private {
        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].id == orderId) {
                // Move the last order to the deleted position and pop it to remove from the array
                orders[i] = orders[orders.length - 1];
                orders.pop();
                break;
            }
        }
    }

    // Function to get buy orders
    function getBuyOrders() public view returns (Order[] memory) {
        return filterOrders(true);
    }

    // Function to get sell orders
    function getSellOrders() public view returns (Order[] memory) {
        return filterOrders(false);
    }

    // Internal function to filter orders based on buy/sell type
    function filterOrders(bool isBuyOrder) internal view returns (Order[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].isBuyOrder == isBuyOrder && !orders[i].isFulfilled) {
                count++;
            }
        }

        Order[] memory filteredOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].isBuyOrder == isBuyOrder && !orders[i].isFulfilled) {
                filteredOrders[index] = orders[i];
                index++;
            }
        }
        return filteredOrders;
    }
}