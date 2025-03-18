<template>
    <div class="c-default-camera-img"></div>
</template>
<script>
export default {
    name: 'DefaultCameraImg',
    props: {
        fontSize: {
            type: Number,
            default: 80
        }
    }
};
</script>
<style lang="scss" scoped>
.c-default-camera-img {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #3d3d3d;
    .multicon {
        width: 100%;
        height: 100%;
    }
}
</style>
