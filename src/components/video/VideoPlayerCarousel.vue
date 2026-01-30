<template>
<div class="relative z-[50] flex h-screen w-full bg-[#0f1015] text-white overflow-hidden"
       v-loading="loading"
       :element-loading-svg="svg"
       element-loading-svg-view-box="-10, -10, 50, 50">

    <!-- Main Content (Player) -->
    <div class="flex-1 relative bg-black flex flex-col justify-center items-center overflow-hidden">
      <!-- Back Button -->
      <div class="absolute top-6 left-6 z-50 cursor-pointer w-10 h-10 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group" @click="$router.back()">
         <el-icon :size="24" class="text-white/70 group-hover:text-white transition-colors"><ArrowLeftBold /></el-icon>
      </div>

      <div class="relative w-full h-full max-w-[calc(100vh*9/16)] xl:max-w-full xl:w-full xl:h-full flex justify-center items-center">
          <el-carousel class="w-full h-full"
                       ref="carousel"
                       direction="vertical"
                       :autoplay="false"
                       :loop="false"
                       indicator-position="none"
                       @mousewheel="rollScroll($event)"
                       @change="carouselChange">
            <el-carousel-item v-for="item in videoList" :key="item.videoId" class="flex justify-center items-center bg-black">
               <div class="relative w-full h-full flex justify-center items-center bg-black">
                  <!-- Video Player Component -->
                  <div class="relative w-full h-full max-w-[calc(100vh*9/16)] xl:max-w-full xl:w-full xl:h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
                      <VideoPlayer v-if="item.publishType==='0'" class="w-full h-full object-contain" :video="item"/>
                      <ImagePlayer v-else :cover-image="item.coverImage" :image-list="item.imageList"/>
                      
                      <!-- Overlay UI -->
                      <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                      
                      <!-- Right Floating Actions (Inside Video) -->
                      <div class="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-6 pointer-events-auto">
                          <!-- Avatar -->
                          <div class="relative group cursor-pointer" @click="handlePersonInfo(item.userId, item)">
                             <el-avatar :size="48" :src="item.userAvatar" class="border-2 border-white shadow-lg transition-transform group-hover:scale-110"/>
                             <div v-if="!item.weatherFollow" class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FE2C55] rounded-full w-5 h-5 flex items-center justify-center text-white shadow-sm" @click.stop="handleAttUser(item.userId)">
                                <el-icon :size="12"><Plus /></el-icon>
                             </div>
                          </div>
                          
                          <!-- Like -->
                          <div class="flex flex-col items-center gap-1 cursor-pointer group" @click="videoLikeClick(item.videoId)">
                             <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white/20 group-active:scale-90">
                                <svg class="w-7 h-7 transition-colors" :class="item.weatherLike ? 'text-[#FE2C55]' : 'text-white'" aria-hidden="true"><use :xlink:href="item.weatherLike ? '#icon-like-ed' : '#icon-like'"></use></svg>
                             </div>
                             <span class="text-xs font-medium text-white drop-shadow-md">{{ item.likeNum }}</span>
                          </div>
                          
                          <!-- Comment (Toggle Right Panel) -->
                          <div class="flex flex-col items-center gap-1 cursor-pointer group" @click="toggleCommentPanel">
                             <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white/20 group-active:scale-90">
                                <svg class="w-7 h-7 text-white" aria-hidden="true"><use xlink:href="#icon-comment"></use></svg>
                             </div>
                             <span class="text-xs font-medium text-white drop-shadow-md">{{ item.commentNum }}</span>
                          </div>
                          
                          <!-- Favorite -->
                          <div class="flex flex-col items-center gap-1 cursor-pointer group">
                             <!-- Popover for Favorite -->
                             <el-popover placement="left" :width="300" :show-arrow="false" :ref="'favoritePop'+item.videoId" trigger="hover">
                                <template #reference>
                                   <div class="flex flex-col items-center gap-1">
                                     <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white/20 group-active:scale-90">
                                        <svg class="w-7 h-7 transition-colors" :class="item.weatherFavorite ? 'text-[#FACC15]' : 'text-white'" aria-hidden="true"><use :xlink:href="item.weatherFavorite ? '#icon-favorite-ed' : '#icon-favorite'"></use></svg>
                                     </div>
                                   </div>
                                </template>
                                <div class="p-4">
                                   <div class="flex justify-between items-center mb-4">
                                      <span class="font-bold">Add to Favorites</span>
                                      <el-button size="small" @click="dialogFormVisible = true">New</el-button>
                                   </div>
                                   <div class="max-h-40 overflow-y-auto mb-4">
                                      <el-checkbox-group v-model="favoriteChecked" @change="handleFavoriteCheckedChange">
                                         <el-checkbox v-for="fav in userFavoriteList" :key="fav.favoriteId" :label="fav.favoriteId" class="w-full mb-2">{{ fav.title }}</el-checkbox>
                                      </el-checkbox-group>
                                   </div>
                                   <div class="flex justify-end gap-2">
                                      <el-button size="small" @click="handleOnlyFavoriteVideo(item.videoId)">Quick Save</el-button>
                                      <el-button type="primary" size="small" :disabled="favoriteBtn" @click="handleCollectVideo(item.videoId)">Done</el-button>
                                   </div>
                                </div>
                             </el-popover>
                             <span class="text-xs font-medium text-white drop-shadow-md">{{ item.favoritesNum }}</span>
                          </div>
                          
                          <!-- Share -->
                          <div class="flex flex-col items-center gap-1 cursor-pointer group">
                             <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white/20 group-active:scale-90">
                                <svg class="w-7 h-7 text-white" aria-hidden="true"><use xlink:href="#icon-share"></use></svg>
                             </div>
                             <span class="text-xs font-medium text-white drop-shadow-md">Share</span>
                          </div>
                      </div>
                      
                      <!-- Bottom Info -->
                      <div class="absolute bottom-4 left-4 right-16 z-20 text-left pointer-events-auto">
                          <div class="mb-2 flex items-center gap-2">
                             <span class="text-lg font-bold text-white drop-shadow-md cursor-pointer hover:underline" @click="handlePersonInfo(item.userId, item)">@{{ item.userNickName }}</span>
                             <span class="text-xs text-gray-300 drop-shadow-md">{{ smartDateFormat(item.createTime) }}</span>
                             <div v-if="item.positionFlag==='1' && item.position" class="flex items-center bg-black/30 px-2 py-0.5 rounded text-xs text-gray-300">
                                <el-icon class="mr-1"><Location /></el-icon>
                                {{ item.position.city || item.position.province }}
                             </div>
                          </div>
                          <div class="text-sm text-white/90 mb-2 line-clamp-2 drop-shadow-md" v-html="item.videoTitle"></div>
                          <div class="flex flex-wrap gap-2">
                             <span v-for="tag in item.tags" :key="tag" class="text-xs font-bold text-yellow-400 drop-shadow-md cursor-pointer hover:text-yellow-300" @click="handleClickVideoTag(tag)">#{{ tag }}</span>
                          </div>
                      </div>
                  </div>
               </div>
            </el-carousel-item>
          </el-carousel>
          
          <!-- Navigation Buttons -->
          <div class="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30 hidden xl:flex">
             <div class="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/80 flex items-center justify-center cursor-pointer transition-all" @click="handleVideoPrev">
                <el-icon color="white"><ArrowUpBold /></el-icon>
             </div>
             <div class="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/80 flex items-center justify-center cursor-pointer transition-all" @click="handleVideoNext">
                <el-icon color="white"><ArrowDownBold /></el-icon>
             </div>
          </div>
      </div>
    </div>

    <!-- Right Sidebar (Comments) -->
    <div class="bg-[#0f1015] border-l border-white/5 flex flex-col transition-all duration-300 ease-in-out z-40 relative" 
         :class="showRightPanel ? 'w-[360px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full overflow-hidden'">
       
       <!-- Close Button (Absolute) -->
       <div class="absolute top-4 right-4 z-50 cursor-pointer text-gray-400 hover:text-white" @click="showRightPanel = false">
          <el-icon :size="20"><Close /></el-icon>
       </div>

       <!-- Tabs -->
       <div class="flex border-b border-white/5 pr-10">
          <div class="flex-1 py-4 text-center text-sm font-medium cursor-pointer transition-colors relative" 
               :class="activeTab === 'comments' ? 'text-white' : 'text-gray-500 hover:text-gray-300'"
               @click="activeTab = 'comments'">
             Comments <span class="text-xs bg-gray-800 px-1.5 py-0.5 rounded-full ml-1">{{ currentVideo?.commentNum || 0 }}</span>
             <div v-if="activeTab === 'comments'" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FE2C55]"></div>
          </div>
          <div class="flex-1 py-4 text-center text-sm font-medium cursor-pointer transition-colors relative"
               :class="activeTab === 'creator' ? 'text-white' : 'text-gray-500 hover:text-gray-300'"
               @click="activeTab = 'creator'">
             Creator
             <div v-if="activeTab === 'creator'" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FE2C55]"></div>
          </div>
       </div>
       
       <!-- Content -->
       <div class="flex-1 overflow-hidden relative">
          <div v-if="activeTab === 'comments'" class="h-full">
             <VideoComment :video-id="currentVideo?.videoId" :show="true" @emitUpdateVideoCommentNum="updateVideoCommentNumEmit" />
          </div>
          <div v-else class="h-full p-4 text-center text-gray-500">
             <div class="flex flex-col items-center mt-10">
                <el-avatar :size="80" :src="currentVideo?.userAvatar" class="mb-4"/>
                <h3 class="text-xl font-bold text-white mb-2">{{ currentVideo?.userNickName }}</h3>
                <el-button type="primary" class="w-full mt-4" @click="handleAttUser(currentVideo?.userId)">
                   {{ currentVideo?.weatherFollow ? 'Unfollow' : 'Follow' }}
                </el-button>
             </div>
          </div>
       </div>
    </div>
  </div>
  <!-- 新建收藏夹提示框 -->
  <el-dialog
      v-model="dialogFormVisible"
      title="新建收藏夹"
      width="400px"
      align-center>
    <!--收藏夹名称输入框-->
    <div>
      <div class="mb5">收藏夹封面</div>
      <div class="mtb5">收藏夹名称</div>
      <el-input v-model="userFavoriteForm.title"
                placeholder="收藏夹的名称"
                clearable
                maxlength="10"
                show-word-limit
                type="text"></el-input>
      <div class="mtb5">收藏夹描述</div>
      <el-input v-model="userFavoriteForm.description"
                placeholder="收藏夹的描述..."
                clearable
                maxlength="100"
                show-word-limit
                type="textarea"></el-input>
    </div>
    <div class="flex-between">
      <div class="mtb5">
        <p class="fs8">>设置为公开</p>
        <p class="fs7 cg">公开后有机会被推荐，帮助到更多人</p>
      </div>
      <div>
        <el-switch
            v-model="userFavoriteForm.showStatus"
            active-value="0"
            inactive-value="1"
            active-color="#13ce66"
            inactive-color="#ff4949">
        </el-switch>
      </div>
    </div>
    <div class="tac">
      <el-button class="w100" type="primary" @click="handleCreateFavorite">确认</el-button>
    </div>
  </el-dialog>
  <!-- 用户视频详情弹窗 -->
  <!--  <el-dialog-->
  <!--      v-model="userVideoDialogVisible"-->
  <!--      modal="false"-->
  <!--      custom-class="user-video-dialog"-->
  <!--      fullscreen-->
  <!--      destroy-on-close="true"-->
  <!--      align-center>-->
  <!--    <div class="user-video-dialog-body wh100">-->
  <!--      &lt;!&ndash;      关闭按钮&ndash;&gt;-->
  <!--      <div class="user-video-dialog-close flex-center" @click="handleUserVideoDialogClose">-->
  <!--        <svg class="icon1-5rem" aria-hidden="true">-->
  <!--          <use xlink:href="#icon-back"></use>-->
  <!--        </svg>-->
  <!--      </div>-->
  <!--      &lt;!&ndash;      背景&ndash;&gt;-->
  <!--      <div class="pa wh100" style="background-color: black">-->
  <!--        <img v-if="dialogVideo.coverImage" class="video-cover wh100"-->
  <!--             style="filter: blur(40px);opacity: 0.8;user-select: none;" :src="dialogVideo.coverImage" alt=""/>-->
  <!--      </div>-->
  <!--      <div class="user-video-box wh100" :style="{ backgroundImage: `url(${dialogVideo.coverImage})` }">-->
  <!--        <div class="user-video-container h100 pr">-->
  <!--          &lt;!&ndash;      展开按钮&ndash;&gt;-->
  <!--          <div class="user-video-dialog-more-open flex-center"-->
  <!--               @click="handleUserVideoDialogMoreOpen(dialogVideo.userId)">-->
  <!--            <svg class="icon1-5rem" aria-hidden="true">-->
  <!--              <use xlink:href="#icon-open"></use>-->
  <!--            </svg>-->
  <!--          </div>-->
  <!--          &lt;!&ndash;            图文轮播&ndash;&gt;-->
  <!--          <ImagePlayer v-if="dialogVideo.publishType==='1'" :cover-image="dialogVideo.coverImage"-->
  <!--                       :image-list="dialogVideo.imageList"/>-->
  <!--          &lt;!&ndash;            视频&ndash;&gt;-->
  <!--          <VideoPlayer v-if="dialogVideo.publishType==='0'"-->
  <!--                       class="videoPlayer wh100"-->
  <!--                       id="videoPlayer"-->
  <!--                       ref="videoPlayer"-->
  <!--                       :video="dialogVideo"/>-->
  <!--          &lt;!&ndash;          视频简介区域&ndash;&gt;-->
  <!--          <div class="videoinfo-area">-->
  <!--            &lt;!&ndash;              定位信息&ndash;&gt;-->
  <!--            <div v-if="dialogVideo.positionFlag==='1'">-->
  <!--              <div v-if="dialogVideo.position!=null" class="video-position mtb5 flex-center">-->
  <!--                <svg class="icon mr5px" aria-hidden="true">-->
  <!--                  <use xlink:href="#icon-position"></use>-->
  <!--                </svg>-->
  <!--                <span v-if="dialogVideo.position.city" class="position-city fs9">{{ dialogVideo.position.city }}</span>-->
  <!--                <span v-else class="position-city fs9">{{ dialogVideo.position.province }}</span>-->
  <!--                <span class="position-dist fs9">{{ dialogVideo.position.district }}</span>-->
  <!--                <span class="position-add fs9">{{ parseAddress(dialogVideo.position) }}</span>-->
  <!--              </div>-->
  <!--            </div>-->
  <!--            &lt;!&ndash;              视频信息&ndash;&gt;-->
  <!--            <div class="video-title one-line cw fs125 fw600">-->
  <!--              <span>@ </span><span v-html="dialogVideo.userNickName" class="cp"-->
  <!--                                   @click="handleLinkUserInfo(dialogVideo.userId)"></span>-->
  <!--              <span class="fs9 fw400 cg"> · {{ smartDateFormat(dialogVideo.createTime) }}</span>-->
  <!--            </div>-->
  <!--            <div v-html="dialogVideo.videoTitle" class="video-title one-line cw fw400 mtb5"></div>-->
  <!--            <div>-->
  <!--                <span v-for="tag in dialogVideo.tags" class="video-tag fs9 cp mr5px"-->
  <!--                      @click="handleClickVideoTag(tag)"><span>#</span>{{ tag }}</span>-->
  <!--            </div>-->
  <!--          </div>-->
  <!--          &lt;!&ndash;          视频点赞等操作区域&ndash;&gt;-->
  <!--          <div class="video-operate">-->
  <!--            <div class="operate-area">-->
  <!--              <div class="video-author">-->
  <!--                <el-avatar v-if="dialogVideo.userAvatar"-->
  <!--                           class="user-avatar cp hv-scale"-->
  <!--                           :size="64"-->
  <!--                           :src="dialogVideo.userAvatar"-->
  <!--                           lazy/>-->
  <!--                <el-avatar v-else-->
  <!--                           class="user-avatar cp"-->
  <!--                           :icon="UserFilled"/>-->
  <!--                <span v-if="!dialogVideo.weatherFollow" class="user-att cp operate-icon">-->
  <!--                    <svg class="icon1-5rem" aria-hidden="true" @click="handleAttUser(dialogVideo.userId)">-->
  <!--                      <use xlink:href="#icon-attention"></use></svg>-->
  <!--                  </span>-->
  <!--              </div>-->
  <!--              &lt;!&ndash;            点赞  &ndash;&gt;-->
  <!--              <div class="op">-->
  <!--                <svg v-if="dialogVideo.weatherLike" class="icon32 operate-svg" aria-hidden="true"-->
  <!--                     @click="videoLikeClick(dialogVideo.videoId)">-->
  <!--                  <use xlink:href="#icon-like-ed"></use>-->
  <!--                </svg>-->
  <!--                <svg v-else class="icon32 operate-svg" aria-hidden="true" @click="videoLikeClick(dialogVideo.videoId)">-->
  <!--                  <use xlink:href="#icon-like"></use>-->
  <!--                </svg>-->
  <!--                <div style="text-align: center;color: white">{{ dialogVideo.likeNum }}</div>-->
  <!--              </div>-->
  <!--              &lt;!&ndash;              评论&ndash;&gt;-->
  <!--              <div class="op">-->
  <!--                <svg class="icon32 operate-svg" aria-hidden="true" @click="videoCommentClick(dialogVideo.videoId)">-->
  <!--                  <use xlink:href="#icon-comment"></use>-->
  <!--                </svg>-->
  <!--                <div style="text-align: center;color: white">{{ dialogVideo.commentNum }}</div>-->
  <!--              </div>-->
  <!--              &lt;!&ndash;              收藏&ndash;&gt;-->
  <!--              <div class="op">-->
  <!--                &lt;!&ndash;收藏按钮弹框&ndash;&gt;-->
  <!--                <el-popover placement="left-end"-->
  <!--                            :width="300"-->
  <!--                            :show-arrow="false"-->
  <!--                            :ref="'favoritePop'+dialogVideo.videoId">-->
  <!--                  &lt;!&ndash;收藏按钮根据是否收藏显示不同的状态&ndash;&gt;-->
  <!--                  <template #reference>-->
  <!--                    <svg v-if="dialogVideo.weatherFavorite" class="icon32 operate-svg" aria-hidden="true"-->
  <!--                         @click="handleCancelFavoriteOver(dialogVideo.videoId)"-->
  <!--                         @mouseover.stop="handleFavoriteOver(dialogVideo.videoId)">-->
  <!--                      <use xlink:href="#icon-favorite-ed"></use>-->
  <!--                    </svg>-->
  <!--                    <svg v-else class="icon32 operate-svg" aria-hidden="true">-->
  <!--                      <use xlink:href="#icon-favorite"></use>-->
  <!--                    </svg>-->
  <!--                  </template>-->
  <!--                  <template #default>-->
  <!--                    &lt;!&ndash;弹窗主体&ndash;&gt;-->
  <!--                    <div class="p1rem" style="min-height: 12vh;">-->
  <!--                      &lt;!&ndash;头部&ndash;&gt;-->
  <!--                      <div class="flex-between mb5">-->
  <!--                        <span>选择收藏夹</span>-->
  <!--                        &lt;!&ndash;新建文件夹按钮&ndash;&gt;-->
  <!--                        <div>-->
  <!--                          <el-button class="tac" @click="dialogFormVisible = true">-->
  <!--                            <el-icon class="mr-5r" :size="16">-->
  <!--                              <CirclePlus/>-->
  <!--                            </el-icon>-->
  <!--                            新建-->
  <!--                          </el-button>-->
  <!--                        </div>-->
  <!--                      </div>-->
  <!--                      &lt;!&ndash;卡片主题内容列表&ndash;&gt;-->
  <!--                      <div class="favorite-container">-->
  <!--                        <el-checkbox-group v-model="favoriteChecked"-->
  <!--                                           @change="handleFavoriteCheckedChange">-->
  <!--                          <el-checkbox class="mb5 w100"-->
  <!--                                       v-for="item2 in userFavoriteList"-->
  <!--                                       border-->
  <!--                                       :key="item2.favoriteId"-->
  <!--                                       :label="item2.favoriteId"-->
  <!--                                       :name="item2.title">{{ item2.title }}-->
  <!--                          </el-checkbox>-->
  <!--                        </el-checkbox-group>-->
  <!--                      </div>-->
  <!--                      <div class="favorite-op tac">-->
  <!--                        &lt;!&ndash;                          已收藏&ndash;&gt;-->
  <!--                        &lt;!&ndash;                          <el-button v-if="item.weatherFavorite"&ndash;&gt;-->
  <!--                        &lt;!&ndash;                                     type="warning"&ndash;&gt;-->
  <!--                        &lt;!&ndash;                                     disabled>已收藏&ndash;&gt;-->
  <!--                        &lt;!&ndash;                          </el-button>&ndash;&gt;-->
  <!--                        &lt;!&ndash;                          <el-button v-else&ndash;&gt;-->
  <!--                        &lt;!&ndash;                                     type="info"&ndash;&gt;-->
  <!--                        &lt;!&ndash;                                     @click="handleOnlyFavoriteVideo(item.videoId)">仅收藏视频&ndash;&gt;-->
  <!--                        &lt;!&ndash;                          </el-button>&ndash;&gt;-->
  <!--                        <el-button-->
  <!--                            type="info"-->
  <!--                            @click="handleOnlyFavoriteVideo(dialogVideo.videoId)">仅收藏视频-->
  <!--                        </el-button>-->
  <!--                        <el-button type="primary"-->
  <!--                                   :disabled="favoriteBtn"-->
  <!--                                   @click="handleCollectVideo(dialogVideo.videoId)">收藏至收藏夹-->
  <!--                        </el-button>-->
  <!--                      </div>-->
  <!--                    </div>-->
  <!--                  </template>-->
  <!--                </el-popover>-->
  <!--                <div class="video-nums cw tac">{{ dialogVideo.favoritesNum }}</div>-->
  <!--              </div>-->
  <!--              &lt;!&ndash;              分享&ndash;&gt;-->
  <!--              <div class="op">-->
  <!--                <svg class="icon32 operate-svg" aria-hidden="true">-->
  <!--                  <use xlink:href="#icon-share"></use>-->
  <!--                </svg>-->
  <!--                <div class="video-nums cw tac">{{ dialogVideo.favoritesNum }}</div>-->
  <!--              </div>-->
  <!--              &lt;!&ndash;                更多&ndash;&gt;-->
  <!--              <div class="op">-->
  <!--                <el-popover placement="left-end"-->
  <!--                            :width="300">-->
  <!--                  &lt;!&ndash;收藏按钮根据是否收藏显示不同的状态&ndash;&gt;-->
  <!--                  <template #reference>-->
  <!--                    <el-icon class="operate-icon"-->
  <!--                             :size="28"-->
  <!--                             color="white">-->
  <!--                      <MoreFilled/>-->
  <!--                    </el-icon>-->
  <!--                  </template>-->
  <!--                  <template #default>-->
  <!--                    <div class="p1rem">更多</div>-->
  <!--                  </template>-->
  <!--                </el-popover>-->
  <!--              </div>-->
  <!--            </div>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--        <div v-if="showUserVideoMore" class="user-video-slidebar h100">-->
  <!--          <div class="flex-between" style="height: 40px;">-->
  <!--            <el-tabs v-model="tabActiveId" @tab-click="handleTabUserVideoMoreClick">-->
  <!--              <el-tab-pane v-for="item in tabUserVideoMore"-->
  <!--                           :key="item.id"-->
  <!--                           :lazy="true"-->
  <!--                           :label="item.tabName"-->
  <!--                           :name="item.id">-->

  <!--              </el-tab-pane>-->
  <!--            </el-tabs>-->
  <!--            <div class="video-more-close cp flex-center" @click="handleCloseMorePostDialog">-->
  <!--              <Close style="width: 1rem; height: 1rem"/>-->
  <!--            </div>-->
  <!--          </div>-->
  <!--          <div v-if="tabActiveId===1" class="user-info-post">-->
  <!--            &lt;!&ndash;                todo 查询用户详情，粉丝，总获赞&ndash;&gt;-->
  <!--            <div class="user-info mb10px flex-between p1rem" style="border-bottom: 2px solid rgba(144,144,144,0.2)">-->
  <!--              <div class="user-info-left">-->
  <!--                <div class="user-info-name fw600 fs9 cp text-hv-primary mb5px">-->
  <!--                  @<span @click="handleToUserProfile(dialogVideo.userId)">{{ dialogVideo.userNickName }}</span> >-->
  <!--                </div>-->
  <!--                <div class="flex-start">-->
  <!--                  <div class="=user-info-fans flex-center">-->
  <!--                    <div class="mr-5r fs8">粉丝</div>-->
  <!--                    <div class="follow-right-8 fw600">{{ 10 }}</div>-->
  <!--                  </div>-->
  <!--                  <div class="user-info-like flex-center">-->
  <!--                    <div class="mr-5r fs8">获赞</div>-->
  <!--                    <div class="fw600">{{ 1 }}</div>-->
  <!--                  </div>-->
  <!--                </div>-->
  <!--              </div>-->
  <!--              <div class="user-info-follow">-->
  <!--                <el-button v-if="dialogVideo.weatherFollow" type="info" class="fs9">已关注</el-button>-->
  <!--                <el-button v-else type="primary" class="fs9">关注</el-button>-->
  <!--              </div>-->
  <!--            </div>-->
  <!--            &lt;!&ndash;                作品区域&ndash;&gt;-->
  <!--            <div class="user-post-area">-->
  <!--              <el-scrollbar v-infinite-scroll="loadMoreUserPost" style="padding: 0 .5rem;">-->
  <!--                <div class="user-post"-->
  <!--                     v-for="item in userPostList"-->
  <!--                     :key="item.videoId"-->
  <!--                     @click="handlePlayVideoPost(item)">-->
  <!--                  <div class="post-card cp wh100 flex-center">-->
  <!--                    &lt;!&ndash;                      封面&ndash;&gt;-->
  <!--                    <img class="post-cover" :src="item.coverImage"/>-->
  <!--                    &lt;!&ndash;                      获赞&ndash;&gt;-->
  <!--                    <div class="post-like flex-center">-->
  <!--                      <svg class="icon1rem" aria-hidden="true">-->
  <!--                        <use xlink:href="#icon-like-num"></use>-->
  <!--                      </svg>-->
  <!--                      <span class="ml-5r">{{ item.likeNum }}</span>-->
  <!--                    </div>-->
  <!--                    &lt;!&ndash;                      视频类型：图文&ndash;&gt;-->
  <!--                    <div v-if="item.publishType===1" class="post-type flex-center">-->
  <!--                      <svg class="icon1rem" aria-hidden="true">-->
  <!--                        <use xlink:href="#icon-pics"></use>-->
  <!--                      </svg>-->
  <!--                      <span class="type-desc fs7 fw500 ml5px">图文</span>-->
  <!--                    </div>-->
  <!--                  </div>-->
  <!--                </div>-->
  <!--                <div v-if="UserPostNotMore" class="w100">-->
  <!--                  <el-divider>暂无更多数据</el-divider>-->
  <!--                </div>-->
  <!--                <el-backtop :right="16" :bottom="16" target=".el-dialog .el-scrollbar__wrap"-->
  <!--                            :visibility-height="10"/>-->
  <!--              </el-scrollbar>-->
  <!--            </div>-->
  <!--            <div v-if="tabActiveId===2">-->
  <!--              评论-->
  <!--            </div>-->
  <!--            <div v-if="tabActiveId===3">-->
  <!--              相关推荐-->
  <!--            </div>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--  </el-dialog>-->
  <el-dialog
      v-model="userVideoDialogVisible"
      :modal="false"
      class="user-video-dialog"
      fullscreen
      :destroy-on-close="true"
      align-center>
    <VideoPlayDialog :dialog-video="dialogVideo" @dialogVisible="dialogVisibleEmit"/>
  </el-dialog>
</template>

<script>
import {
    createFavorite,
    favoriteVideoToCollection,
    likeVideo,
    myFavoriteList,
    onlyFavoriteVideo, userUnFavoriteVideo,
    videoInWhoseCollection
} from '@/api/behave.js';
import { followUser } from '@/api/social.js';
import { videoUserpage } from "@/api/video.js";
import VideoComment from "@/components/video/comment/VideoComment.vue";
import ImagePlayer from "@/components/video/ImagePlayer.vue";
import UserVideoDialog from "@/components/video/UserVideoDialog.vue";
import VideoPlayDialog from "@/components/video/VideoPlayDialog.vue";
import VideoPlayer from "@/components/video/VideoPlayer.vue";
import { userInfoX } from "@/store/userInfoX";
import { encodeData, smartDateFormat } from "@/utils/roydon.js";
import {
    ArrowDownBold,
    ArrowLeftBold,
    ArrowUpBold,
    ChatDotRound, ChromeFilled, CirclePlus, Close,
    Location,
    MoreFilled,
    Plus,
    QuestionFilled,
    Setting,
    UserFilled
} from '@element-plus/icons-vue';

export default {
  name: 'VideoPlayerCarousel',
  components: {
    Close,
    ImagePlayer,
    UserVideoDialog,
    CirclePlus,
    QuestionFilled,
    ArrowDownBold,
    ArrowUpBold,
    ArrowLeftBold,
    MoreFilled,
    VideoPlayer,
    VideoComment,
    VideoPlayDialog,
    Setting, Location, Plus
  },
  computed: {
    UserFilled() {
      return UserFilled
    },
    ChatDotRound() {
      return ChatDotRound
    },
    ChromeFilled() {
      return ChromeFilled
    },
    Close() {
      return Close
    },
  },
  props: {
    videoList: Array,
    loading: Boolean
  },
  data() {
    return {
      // New Layout Props
      showRightPanel: false,
      activeTab: 'comments',
      currentVideo: null,
      
      dialogFormVisible: false,
      favoriteBtn: false,
      userFavoriteForm: {
        title: "",
        description: "",
        coverImage: "",
        showStatus: "0"
      },
      userFavoriteList: '',
      userFavoriteTotal: undefined,
      svg: `<path class="path" d=" M 30 15 L 28 17 M 25.61 25.61 A 15 15, 0, 0, 1, 15 30 A 15 15, 0, 1, 1, 27.99 7.5 L 15 15" style="stroke-width: 4px; fill: rgba(10, 10, 10, 0)"/>`,
      showVideo: true,
      timeOut: null,
      drawer: false,
      currentIndex: 0, // 当前视频索引
      preloadedVideos: new Set(), // 已预加载的视频ID集合
      commentInput: '',
      // 视频评论查询参数
      commentQueryParams: {
        pageNum: 1,
        pageSize: 10,
        videoId: undefined,
      },
      commentTotal: 0,
      videoId: '',
      videoCommentTree: [],
      showVideoComment: false, // 控制评论子组件显隐
      videoDisplay: true,
      isLiked: false, // 是否已经快捷键点赞
      startIndex: 1,
      favoriteChecked: [],//已选收藏夹
      waitLoadMore: false,
      userVideoDialogVisible: false,// 点击用户头像跳转详情页面弹窗
      dialogVideo: null,
      showUserVideoMore: false,
      tabActiveId: 1,//热榜区域
      tabUserVideoMore: [
        {id: 1, tabName: "他的作品"},
        {id: 2, tabName: "评论"},
        {id: 3, tabName: "相关推荐"}
      ],
      // 他的作品dto
      videoUserPageDTO: {
        userId: null,
        videoTitle: "",
        pageNum: 1,
        pageSize: 15
      },
      userPostList: [],
      userPostTotal: 0,
      loadingMoreUserPost: false,
      UserPostNotMore: false,
    }
  },
  emits: ['reloadVideoFeed'],
  mounted() {
    // 初始化时预加载前几个视频
    this.$nextTick(() => {
      this.preloadAdjacentVideos(0)
    })
  },
  watch: {
    videoList: {
      handler(val) {
        if (val && val.length > 0 && !this.currentVideo) {
          this.currentVideo = val[0];
        }
      },
      immediate: true
    },
    dialogVideo(newVideo) {
      // 监听 dialogVideo 的变化

      // this.$refs.videoPlayer.loadVideo(newVideo); // 调用 VideoPlayer 组件的方法重新加载视频
    }
  },
  methods: {
    toggleCommentPanel() {
      this.showRightPanel = !this.showRightPanel;
    },
    smartDateFormat,
    dialogVisibleEmit(flag) {
      this.userVideoDialogVisible = flag
    },
    // 鼠标悬停显示
    handleFavoriteOver(videoId) {
      // console.log("handleFavoriteShow" + videoId)
      // 查询登录用户的收藏夹列表
      myFavoriteList().then(res => {
        if (res.code === 200) {
          this.userFavoriteList = res.data
        }
      })
      // 查询当前视频在那些收藏夹
      videoInWhoseCollection(videoId).then(res => {
        if (res.code === 0 || res.code === 200) {
          // 确保 favoriteChecked 是数组
          const data = res.data
          if (Array.isArray(data)) {
            this.favoriteChecked = data
          } else if (data && Array.isArray(data.items)) {
            this.favoriteChecked = data.items.map(item => item.favorite_id || item.favoriteId)
          } else {
            this.favoriteChecked = []
          }
        }
      })
      // 鼠标悬停事件改为显示
      this.$refs[`favoritePop${videoId}`][0].showPopper = true
    },
    // 鼠标离开后显示事件改为不显示
    handleFavoriteLeave(videoId) {
      this.$refs[`favoritePop${videoId}`][0].showPopper = false
    },
    // 点赞视频
    videoLikeClick(videoId) {
      let actionType = 1 // 默认点赞
      this.videoList.forEach((item, index) => {
        if (item.videoId === videoId) {
          // 根据当前状态决定action类型
          actionType = item.weatherLike ? 2 : 1 // 已点赞则取消(2)，未点赞则点赞(1)
          // 设置为已点赞
          item.weatherLike = !item.weatherLike
          if (item.weatherLike) {
            item.likeNum += 1
          } else {
            item.likeNum -= 1
          }
        }
      })
      likeVideo(videoId, actionType).then(res => {
        if (res.code === 200 || res.code === 0) {

        } else {
          this.videoList.forEach((item, index) => {
            if (item.videoId === videoId) {
              // 设置为已点赞
              item.weatherLike = !item.weatherLike
              if (item.weatherLike) {
                item.likeNum += 1
              } else {
                item.likeNum -= 1
              }
            }
          })
        }
      })
    },
    videoCommentClick(videoId) {
      this.videoId = videoId
      this.drawer = true
      this.showVideoComment = true
    },
    // 接收子组件增加视频评论传值
    updateVideoCommentNumEmit(videoId) {
      this.videoList.forEach((item, index) => {
        if (item.videoId === videoId) {
          // 评论数+1
          item.commentNum += 1
        }
      })
    },
    keyDown(e) {
      if (e.keyCode === 38) {
        // 方向键--上
        const _that = this;
        this.drawer = false
        this.showVideoComment = false
        if (!_that.timeOut) {
          _that.timeOut = setTimeout(() => {
            _that.timeOut = null;
            _that.$refs.carousel.prev()
          }, 200);
        }
      }
      if (e.keyCode === 40) {
        // 方向键--下
        const _that = this;
        this.drawer = false
        this.showVideoComment = false
        if (!_that.timeOut) {
          _that.timeOut = setTimeout(() => {
            _that.timeOut = null;
            _that.$refs.carousel.next()
          }, 200);
        }
        if (this.waitLoadMore) {
          this.$emit("reloadVideoFeed", true)
          this.waitLoadMore = false
        }
      }
      if (e.keyCode === 37) {
        console.log("方向键--左")
      }
      if (e.keyCode === 39) {
        console.log("方向键--右")
      }
    },
    // 切换视频暂停视频
    carouselChange(newVal, oldVal) {
      console.log("newVal=>" + newVal + "、oldVal=>" + oldVal + "、videoLength=>" + this.videoList.length)
      this.currentIndex = newVal
      this.currentVideo = this.videoList[newVal]
      
      // 立即暂停所有视频（不使用延迟）
      const videos = document.getElementsByClassName("d-player-video-main");
      for (let i = 0; i < videos.length; i++) {
        videos[i].pause();
      }
      
      // 预加载相邻视频
      this.preloadAdjacentVideos(newVal)
      
      if (newVal === this.videoList.length - 1) {
        this.waitLoadMore = true
      }
    },
    // 预加载相邻视频（前后各2个）
    preloadAdjacentVideos(currentIndex) {
      const preloadRange = 2 // 预加载范围
      const start = Math.max(0, currentIndex - 1)
      const end = Math.min(this.videoList.length - 1, currentIndex + preloadRange)
      
      for (let i = start; i <= end; i++) {
        const video = this.videoList[i]
        if (video && video.videoUrl && !this.preloadedVideos.has(video.videoId)) {
          this.preloadVideo(video)
        }
      }
    },
    // 预加载单个视频
    preloadVideo(video) {
      if (!video.videoUrl || this.preloadedVideos.has(video.videoId)) return
      
      // 使用 link preload 预加载视频
      const existingLink = document.querySelector(`link[href="${video.videoUrl}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'video'
        link.href = video.videoUrl
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }
      
      // 同时预加载封面图
      if (video.coverImage) {
        const img = new Image()
        img.src = video.coverImage
      }
      
      this.preloadedVideos.add(video.videoId)
      console.log('预加载视频:', video.videoId)
    },
    carouselEnd() {
      console.log("end")
    },
    // 鼠标滚轮事件
    rollScroll(event) {
      const _that = this;
      // chrome、ie使用的wheelDelta，火狐使用detail
      const scrollVal = event.wheelDelta || event.detail;
      // 节流 - 优化为200ms响应更快
      if (!_that.timeOut) {
        this.drawer = false
        this.showVideoComment = false
        _that.timeOut = setTimeout(() => {
          _that.timeOut = null;
          scrollVal > 0
              ? _that.$refs.carousel.prev()
              : _that.$refs.carousel.next();
        }, 200);
      } else {
      }
      if (this.waitLoadMore) {
        this.$emit("reloadVideoFeed", true)
        this.waitLoadMore = false
      }
    },
    // playswitch 上一个
    handleVideoPrev() {
      if (!this.timeOut) {
        this.timeOut = setTimeout(() => {
          this.timeOut = null;
          this.$refs.carousel.prev()
        }, 200);
      }
    },
    // playswitch 下一个
    handleVideoNext() {
      console.log("next")
      const _that = this;
      this.drawer = false
      this.showVideoComment = false
      if (!_that.timeOut) {
        _that.timeOut = setTimeout(() => {
          _that.timeOut = null;
          _that.$refs.carousel.next()
        }, 200);
      }
      if (this.waitLoadMore) {
        this.$emit("reloadVideoFeed", true)
        this.waitLoadMore = false
      }
    },
    // 跳转用户详情页面
    handleLinkUserInfo(userId) {
      console.log(userId)
    },
    // 关注用户
    handleAttUser(userId) {
      followUser(userId).then(res => {
        if (res.code === 200) {
          this.$message.success('关注成功')
          // 将数组此条数据改为已关注 weatherFollow = true
          this.videoList.forEach((item, index) => {
            if (item.userId === userId) {
              item.weatherFollow = true;
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    keyDownZ(videoId, e) {
      // 点赞
      if (e.keyCode === 90) {
        console.log(videoId)
        if (!this.isLiked) {
          this.videoLikeClick(videoId)
          this.isLiked = true
        }
      }
    },
    // 创建收藏夹
    handleCreateFavorite() {
      console.log(this.userFavoriteForm)
      createFavorite(this.userFavoriteForm).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.dialogFormVisible = false
          this.userFavoriteForm = {}
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 监听收藏夹多选事件变化
    handleFavoriteCheckedChange(val) {
      this.favoriteBtn = false
    },
    // 仅仅收藏视频
    handleOnlyFavoriteVideo(videoId) {
      onlyFavoriteVideo(videoId).then(res => {
        if (res.code === 200) {
          // 收藏成功，将数组此视频的是否收藏改为已收藏
          this.$message.success("收藏成功")
          this.videoList.forEach((item, index) => {
            if (item.videoId === videoId) {
              if (!item.weatherFavorite) {
                item.favoritesNum = (item.favoritesNum || 0) + 1;
              }
              item.weatherFavorite = true;
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 收藏视频到收藏夹
    handleCollectVideo(videoId) {
      const dto = {
        "videoId": videoId,
        "favorites": this.favoriteChecked
      }
      favoriteVideoToCollection(dto).then(res => {
        if (res.code === 200 && res.data === true) {
          // 收藏成功
          this.$message.success("收藏成功")
          this.videoList.forEach((item, index) => {
            if (item.videoId === videoId) {
              if (!item.weatherFavorite) {
                item.favoritesNum = (item.favoritesNum || 0) + 1;
              }
              item.weatherFavorite = true;
            }
          })
        } else if (res.code === 200 && res.data === false) {
          // 从收藏夹移除
          this.$message.success("收藏成功")
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 取消收藏
    handleCancelFavoriteOver(videoId) {
      console.log("取消收藏=》" + videoId)
      userUnFavoriteVideo(videoId).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.videoList.forEach((item, index) => {
            if (item.videoId === videoId) {
              if (item.weatherFavorite && item.favoritesNum > 0) {
                item.favoritesNum = (item.favoritesNum || 1) - 1;
              }
              item.weatherFavorite = false;
            }
          })
          this.$refs[`favoritePop${videoId}`][0].showPopper = false
        }
      })
      // myFavoriteList().then(res => {
      //   if (res.code === 200) {
      //     this.userFavoriteList = res.data
      //   }
      // })
      // 鼠标悬停事件改为显示
      this.$refs[`favoritePop${videoId}`][0].showPopper = true
    },
    parseAddress(pos) {
      let add = pos.address.split(pos.province)[1]
      // 排除城市
      if (pos.city !== "") {
        add = add.split(pos.city)[1]
      }
      // 排除县
      if (pos.district !== "") {
        add = add.split(pos.district)[1]
      }
      // 排除街道
      if (pos.township !== "") {
        add = add.split(pos.township)[1]
      }
      return add
    },
    // 点击视频标签跳转搜索
    handleClickVideoTag(tag) {
      this.$router.push(`/videoSearch?keyword=${tag}`);
    },
    // 跳转到用户详情页面
    handleToUserProfile(userId) {
      const loginUser = userInfoX().userInfo
      if (userId === loginUser.userId) {
        this.$router.push({
          path: '/user'
        })
      } else {
        this.$router.push({
          path: '/person/' + encodeData(userId)
        })
      }
    },
    // 打开弹框
    handlePersonInfo(userId, video) {

      // 暂停所以视频
      const videos = document.getElementsByClassName("d-player-video-main");
      for (let i = 0; i < videos.length; i++) {
        setTimeout(() => {
          videos[i].pause();
        }, 2);
      }
      // console.log(userId)
      //
      //
      // console.log(video)
      this.dialogVideo = video
      this.userVideoDialogVisible = true
      console.log(this.userVideoDialogVisible)
    },
    // 关闭用户视频弹窗
    handleUserVideoDialogClose() {
      this.userVideoDialogVisible = false
      this.showUserVideoMore = false
      this.videoUserPageDTO = {
        userId: null,
        videoTitle: "",
        pageNum: 1,
        pageSize: 15
      }
      this.userPostList = []
      this.userPostTotal = 0
      this.loadingMoreUserPost = false
      this.UserPostNotMore = false
    },
    // 展开更多
    handleUserVideoDialogMoreOpen(userId) {
      this.showUserVideoMore = !this.showUserVideoMore
      // 获取他的作品
      this.videoUserPageDTO.userId = userId
      videoUserpage(this.videoUserPageDTO).then(res => {
        if (res.code === 200) {
          this.userPostList = res.rows
          this.userPostTotal = res.total
          if (res.total < this.videoUserPageDTO.pageSize) {
            this.UserPostNotMore = true
          }
        }
      })
    },
    // 关闭展开侧边栏
    handleCloseMorePostDialog() {
      this.showUserVideoMore = false
      this.videoUserPageDTO.pageNum = 1
      this.userPostList = []
      this.userPostTotal = 0
      this.loadingMoreUserPost = false
      this.UserPostNotMore = false
    },
    handleTabUserVideoMoreClick() {
      console.log(this.tabActiveId)
    },
    // 点击用户作品
    handlePlayVideoPost(video) {
      this.dialogVideo = video
    },
    loadMoreUserPost() {
      if (this.UserPostNotMore) {
        return;
      }
      if (this.loadingMoreUserPost) {
        return
      }
      this.loadingMoreUserPost = true
      console.log("加载更多")
      this.videoUserPageDTO.pageNum += 1
      videoUserpage(this.videoUserPageDTO).then(res => {
        if (res.code === 200) {
          this.userPostList = this.userPostList.concat(res.rows)
          this.loadingMoreUserPost = false
          if (this.userPostList.length == res.total) {
            this.UserPostNotMore = true
          }
        }
      })
    },
  },
}
</script>
<style scoped lang="scss">
/* Carousel 过渡动画优化 - 使用GPU加速 */
:deep(.el-carousel__container) {
  height: 100%;
  transform: translateZ(0);
  will-change: transform;
}

:deep(.el-carousel__item) {
  transition: transform 0.3s ease-out !important;
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

:deep(.el-carousel__item.is-animating) {
  transition: transform 0.3s ease-out !important;
}

/* 视频播放器容器优化 */
:deep(.d-player-wrap) {
  transform: translateZ(0);
  will-change: contents;
}

:deep(.d-player-video-main) {
  transform: translateZ(0);
}

/* Custom Scrollbar for Nav */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
