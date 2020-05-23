import assert from 'assert'

describe('The / endpoint', () => {
    it('Should get hello world from api response', async () => {
        const response = await global.apiClient.get('/')

        assert.equal(response.body.hello, 'world')
    })
})
