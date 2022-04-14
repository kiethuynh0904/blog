package keeper

import (
	"github.com/kiethuynh0904/blog/x/blog/types"
)

var _ types.QueryServer = Keeper{}
