const axios = require('axios').default;

const { 
    refreshToken, 
    orgId, 
    sddcId, 
    segmentName, 
    segmentGateway,
    segmentSubnet,
    segmentConnectivity } = require('./config.json');

const authURL = `https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize?refresh_token=${refreshToken}`;
const orgURL = `https://vmc.vmware.com/vmc/api/orgs/${orgId}/sddcs/${sddcId}`;

const updateNetworkSegment = (bearerToken, policyURL, segments) => {
    segments.forEach(element => {
        if (element.display_name === segmentName) {
            console.log(element);
            updateSegmentURL = `${policyURL}/policy/api/v1/infra/tier-1s/cgw/segments/${element.id}`;
            const data = {
                display_name: segmentName,
                advanced_config: {
                    connectivity: segmentConnectivity,
                    local_egress: false
                },
                subnets: [{ 
                    gateway_address: segmentGateway, 
                    network: segmentSubnet
                }]
            };
            const options = {
                headers: {
                    'Authorization': 'Bearer ' + bearerToken
                }
            };
            axios.patch(`${updateSegmentURL}`, data, options)
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    })
};

const getNetworkSegments = (bearerToken, policyURL) => {
    const nsxtURL = `${policyURL}/policy/api/v1/infra/tier-1s/cgw/segments`
    axios.get(`${nsxtURL}`, { headers: {
        'Authorization': 'Bearer ' + bearerToken
    }})
    .then(function (response) {
        updateNetworkSegment(bearerToken, policyURL, response.data.results);
    })
    .catch(function (error) {
        console.log(error);
    });
};

const getOrg = (accessToken) => {
    axios.get(`${orgURL}`, { headers: {
        'csp-auth-token': accessToken,
    }})
    .then(function (response) {
        const policyURL = response.data.resource_config.nsx_api_public_endpoint_url;
        getNetworkSegments(accessToken, policyURL);
    })
    .catch(function (error) {
        console.log(error);
    });
};

axios.post(`${authURL}`, {})
.then(function (response) {
    getOrg(response.data.access_token);
})
.catch(function (error) {
    console.log(error);
});