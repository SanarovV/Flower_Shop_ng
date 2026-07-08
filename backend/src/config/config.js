const config = {
    secret: 'd1UCyUDKC0TiWhDbs6U5QWiez6',
    env: process.env.ENV,
    port: process.env.PORT || 3000,
    db: {
        dbUrl: 'mongodb+srv://testuser:testpass12345@cluster0.v8wsc.mongodb.net/flowershop?retryWrites=true&w=majority',
        dbName: 'im',
        dbHost: 'localhost',
        dbPort: 27017,
    },
    deliveryCost: 10,
    deliveryTypes: {delivery: 'delivery', self: 'self'},
    paymentTypes: {cashToCourier: 'cashToCourier', cardOnline: 'cardOnline', cardToCourier: 'cardToCourier'},
    statuses: {new: 'new', pending: 'pending', delivery: 'delivery', cancelled: 'cancelled', success: 'success'}
};

module.exports = config;