package blog_test

import (
	"testing"

	keepertest "github.com/kiethuynh0904/blog/testutil/keeper"
	"github.com/kiethuynh0904/blog/testutil/nullify"
	"github.com/kiethuynh0904/blog/x/blog"
	"github.com/kiethuynh0904/blog/x/blog/types"
	"github.com/stretchr/testify/require"
)

func TestGenesis(t *testing.T) {
	genesisState := types.GenesisState{
		Params:	types.DefaultParams(),
		
		// this line is used by starport scaffolding # genesis/test/state
	}

	k, ctx := keepertest.BlogKeeper(t)
	blog.InitGenesis(ctx, *k, genesisState)
	got := blog.ExportGenesis(ctx, *k)
	require.NotNil(t, got)

	nullify.Fill(&genesisState)
	nullify.Fill(got)

	

	// this line is used by starport scaffolding # genesis/test/assert
}
