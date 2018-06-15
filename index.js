import Web3 from 'web3';
import Vue from 'vue/dist/vue';
import contractData from './contract.json';

const web3 = new Web3(window.web3.currentProvider);
const Vote = new web3.eth.Contract(contractData.abi, contractData.address);

const app = new Vue({
    el: '#app',
    data: {
        address: '',
        proposals: [],
        isHost: false,
        isParticipant: false,
        description: '',
    },
    computed: {
        identity: function() {
            if (this.isHost) {
                return 'Teacher';
            } else if (this.isParticipant) {
                return 'Student';
            }
            return 'Who are you?';
        }
    },
    methods: {
        async refresh() {
            console.log('Querying Vote contract data...');
            const address = (await web3.eth.getAccounts())[0];
            const proposalCount = Number.parseInt(await Vote.methods.proposalCount().call());
            const proposals = [];
            const isHost = (await Vote.methods.host().call()) === address;
            const isParticipant = await Vote.methods.isParticipant(address).call();
            for (let i = 0; i < proposalCount; i += 1) {
                const proposal = await Vote.methods.proposals(i).call();
                proposal.alreadyVoted = await Vote.methods.alreadyVoted(i, address).call();
                proposals.push(proposal);
            }
            this.address = address;
            this.proposals = proposals;
            this.isHost = isHost;
            this.isParticipant = isParticipant;
            console.log('Vote contract data updated.');
        },
        async vote(id, agree) {
            console.log(`Voting for proposal ${id} with value ${agree}...`);
            await Vote.methods.vote(id, agree).send({ from: this.address });
            console.log('Voting done.');
            app.refresh();
        },
        async newProposal() {
            console.log(`Creating new proposal, description: '${this.description}'`);
            await Vote.methods.newProposal(this.description).send({ from: this.address });
            console.log('Proposal created.');
            app.refresh();
        },
    }
});

app.refresh();

window.setInterval(async () => {
    const address = (await web3.eth.getAccounts())[0];
    if (address !== app.address) {
        app.refresh();
    }
}, 2000);
